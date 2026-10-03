#!/usr/bin/env python3
"""
PathForge AI - Career Transition Readiness Training Pipeline
===========================================================
Trains a scikit-learn RandomForestClassifier on the Competency-Based
Proxy-Labeled Career Transition Dataset using a non-leaking GroupShuffleSplit.

DISCLOSURE:
- The readiness_label is a proxy label generated via multi-factor competency rules.
- Real-world predictive validity has NOT been established.
- The model learns the PathForge proxy benchmark, not actual employment outcomes.
"""

import hashlib
import json
import os
import sys
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import LabelEncoder

RANDOM_SEED = 42
MODEL_VERSION = "v1.0.0"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "career_transitions_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_ARTIFACT_PATH = os.path.join(MODELS_DIR, "career_transition_model.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")
FEATURE_SCHEMA_PATH = os.path.join(MODELS_DIR, "feature_schema.json")


def compute_file_hash(filepath: str) -> str:
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def run_pipeline():
    print("=" * 60)
    print("PATHFORGE AI - REPRODUCIBLE ML TRAINING PIPELINE")
    print(f"Model: RandomForestClassifier | Version: {MODEL_VERSION}")
    print("=" * 60)

    # 1. Dataset Loading & Validation
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}. Run ml/dataset/generate_dataset.py first.")

    dataset_hash = compute_file_hash(DATASET_PATH)
    df = pd.read_csv(DATASET_PATH)
    total_rows = len(df)
    print(f"\n[1/7] Loaded Dataset:")
    print(f"      Rows:         {total_rows}")
    print(f"      Columns:      {len(df.columns)}")
    print(f"      SHA-256 Hash: {dataset_hash[:16]}...{dataset_hash[-8:]}")

    assert total_rows == 1800, f"Expected 1800 rows, found {total_rows}"
    assert df.isnull().sum().sum() == 0, "Dataset contains null values!"

    # 2. Encode Target Role & Label
    role_encoder = LabelEncoder()
    df["target_role_encoded"] = role_encoder.fit_transform(df["target_role"])

    target_role_mapping = {
        role: int(idx) for role, idx in zip(role_encoder.classes_, range(len(role_encoder.classes_)))
    }

    class_names = ["low", "moderate", "high"]
    label_encoder = LabelEncoder()
    label_encoder.fit(class_names)
    df["label_encoded"] = label_encoder.transform(df["readiness_label"])

    feature_cols = [
        "skill_match_score",
        "market_demand_score",
        "ai_exposure_score",
        "transferability_score",
        "skill_breadth_score",
        "emerging_skill_alignment",
        "skill_gap_score",
        "experience_years",
        "target_role_experience_requirement",
        "experience_gap",
        "number_of_matching_skills",
        "number_of_missing_skills",
        "transition_effort_score",
        "target_role_encoded"
    ]

    X = df[feature_cols].values
    y = df["label_encoded"].values
    groups = df["archetype_id"].values

    print(f"\n[2/7] Prepared Feature Matrix:")
    print(f"      Feature Count: {len(feature_cols)}")
    print(f"      Features:      {', '.join(feature_cols)}")

    # 3. Non-Leaking Group Train/Test Split (80/20)
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=RANDOM_SEED)
    train_idx, test_idx = next(gss.split(X, y, groups=groups))

    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

    train_archetypes = set(df.iloc[train_idx]["archetype_id"].unique())
    test_archetypes = set(df.iloc[test_idx]["archetype_id"].unique())

    # Leakage Assertion: Train and Test archetypes must have ZERO intersection
    overlap = train_archetypes & test_archetypes
    assert len(overlap) == 0, f"DATA LEAKAGE DETECTED! Overlapping archetypes: {overlap}"

    print(f"\n[3/7] Train/Test Split (GroupShuffleSplit by archetype_id):")
    print(f"      Train Samples:    {len(X_train)} (Archetypes: {len(train_archetypes)})")
    print(f"      Test Samples:     {len(X_test)} (Archetypes: {len(test_archetypes)})")
    print(f"      Archetype Leak:   0 (Strict disjoint set verification passed)")

    # 4. Model Training
    hyperparameters = {
        "n_estimators": 100,
        "max_depth": 6,
        "min_samples_split": 5,
        "min_samples_leaf": 2,
        "random_state": RANDOM_SEED,
        "class_weight": "balanced"
    }

    print(f"\n[4/7] Training RandomForestClassifier...")
    clf = RandomForestClassifier(**hyperparameters)
    clf.fit(X_train, y_train)
    print("      Model training complete.")

    # 5. Held-Out Test Evaluation
    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec_macro = precision_score(y_test, y_pred, average="macro", zero_division=0)
    rec_macro = recall_score(y_test, y_pred, average="macro", zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average="macro", zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average="weighted", zero_division=0)
    roc_auc = roc_auc_score(y_test, y_prob, multi_class="ovr", average="macro")

    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(y_test, y_pred, target_names=label_encoder.classes_, output_dict=True)

    print(f"\n[5/7] Held-Out Test Set Performance:")
    print(f"      Accuracy:          {acc:.4f} ({acc*100:.2f}%)")
    print(f"      Precision (Macro): {prec_macro:.4f}")
    print(f"      Recall (Macro):    {rec_macro:.4f}")
    print(f"      F1-Score (Macro):  {f1_macro:.4f}")
    print(f"      F1-Score (Weight): {f1_weighted:.4f}")
    print(f"      ROC-AUC (Macro):   {roc_auc:.4f}")

    print(f"\nConfusion Matrix:")
    print(f"      {label_encoder.classes_}")
    for row, cls_name in zip(cm, label_encoder.classes_):
        print(f"      {cls_name:<10}: {row}")

    # 6. Feature Importance Extraction
    importances = clf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    feature_importance_list = [
        {"feature": feature_cols[i], "importance": round(float(importances[i]), 4)}
        for i in sorted_idx
    ]

    print(f"\n[6/7] Feature Importances:")
    for item in feature_importance_list:
        print(f"      {item['feature']:<35}: {item['importance']:.4f}")

    # 7. Model & Metadata Serialization
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(clf, MODEL_ARTIFACT_PATH)
    print(f"\n[7/7] Saved Model Artifact: {MODEL_ARTIFACT_PATH}")

    metadata = {
        "model_version": MODEL_VERSION,
        "algorithm": "RandomForestClassifier",
        "hyperparameters": hyperparameters,
        "dataset_metadata": {
            "dataset_type": "Proxy-labeled synthetic benchmark",
            "dataset_filename": "career_transitions_dataset.csv",
            "dataset_sha256": dataset_hash,
            "total_rows": total_rows,
            "train_rows": len(X_train),
            "test_rows": len(X_test),
            "train_archetypes_count": len(train_archetypes),
            "test_archetypes_count": len(test_archetypes),
            "split_method": f"GroupShuffleSplit(grouped_by='archetype_id', test_size=0.20, random_state={RANDOM_SEED})"
        },
        "evaluation_metrics": {
            "test_accuracy": round(float(acc), 4),
            "test_precision_macro": round(float(prec_macro), 4),
            "test_recall_macro": round(float(rec_macro), 4),
            "test_f1_macro": round(float(f1_macro), 4),
            "test_f1_weighted": round(float(f1_weighted), 4),
            "test_roc_auc_ovr_macro": round(float(roc_auc), 4),
            "confusion_matrix": cm,
            "class_labels": list(label_encoder.classes_),
            "classification_report": report
        },
        "feature_importances": feature_importance_list,
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "disclaimer": "Offline benchmark performance on proxy-labeled synthetic data. Real-world predictive validity has not been established; this model does not predict actual hiring success."
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    schema_data = {
        "model_version": MODEL_VERSION,
        "feature_count": len(feature_cols),
        "features": feature_cols,
        "target_roles": target_role_mapping,
        "class_labels": {int(idx): name for idx, name in enumerate(label_encoder.classes_)},
        "readiness_score_formula": "0.15 * P(low) + 0.55 * P(moderate) + 0.90 * P(high)"
    }

    with open(FEATURE_SCHEMA_PATH, "w", encoding="utf-8") as f:
        json.dump(schema_data, f, indent=2)

    print(f"      Saved Model Metadata: {METADATA_PATH}")
    print(f"      Saved Feature Schema:  {FEATURE_SCHEMA_PATH}")
    print("\n=======================================================")
    print("PIPELINE EXECUTION FINISHED SUCCESSFULLY")
    print("=======================================================\n")


if __name__ == "__main__":
    run_pipeline()
