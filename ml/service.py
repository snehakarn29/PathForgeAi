#!/usr/bin/env python3
"""
PathForge AI - Career Transition Readiness Inference Service
============================================================
FastAPI inference microservice running on port 5001.
Loads the trained RandomForestClassifier once at startup and provides
low-latency predictions for transition readiness.

CRITICAL TRANSPARENCY:
- Prototype ML model trained on a competency-based proxy benchmark.
- This is not a prediction of actual hiring success or employment outcomes.
"""

import json
import os
import time
from typing import Dict, List, Optional

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "career_transition_model.joblib")
FEATURE_SCHEMA_PATH = os.path.join(MODELS_DIR, "feature_schema.json")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

app = FastAPI(
    title="PathForge AI - Transition Readiness ML Service",
    description="Inference microservice for competency-based transition readiness predictions.",
    version="1.0.0"
)

# Enable CORS for local cross-port calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory model cache loaded ONCE at startup
model_artifact = None
feature_schema = None
model_metadata = None
startup_time = time.time()

FEATURE_HUMAN_LABELS = {
    "skill_match_score": "Direct Skill Overlap",
    "skill_gap_score": "Missing Competency Deficit",
    "number_of_matching_skills": "Matching Skills Count",
    "transition_effort_score": "Upskilling Effort Intensity",
    "number_of_missing_skills": "Missing Skills Count",
    "experience_gap": "Experience Alignment",
    "market_demand_score": "Labor Market Demand",
    "transferability_score": "Cross-Domain Portability",
    "skill_breadth_score": "Domain Breadth",
    "emerging_skill_alignment": "Frontier Tech Alignment",
    "ai_exposure_score": "Automation Vulnerability Index",
    "experience_years": "Candidate Experience Years",
    "target_role_experience_requirement": "Target Role Expected Years",
    "target_role_encoded": "Target Role Domain Categorization"
}


@app.on_event("startup")
def load_model_on_startup():
    global model_artifact, feature_schema, model_metadata
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model file not found at {MODEL_PATH}. Run ml/train.py first.")

    print(f"[ML Service] Loading model artifact from {MODEL_PATH}...")
    model_artifact = joblib.load(MODEL_PATH)

    with open(FEATURE_SCHEMA_PATH, "r", encoding="utf-8") as f:
        feature_schema = json.load(f)

    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        model_metadata = json.load(f)

    print(f"[ML Service] Successfully loaded model {model_metadata.get('model_version')} ({model_metadata.get('algorithm')}).")


class TransitionReadinessRequest(BaseModel):
    skill_match_score: float = Field(..., ge=0.0, le=1.0, description="Competency match ratio [0.0 - 1.0]")
    market_demand_score: float = Field(..., ge=0.0, le=1.0, description="Normalized market demand [0.0 - 1.0]")
    ai_exposure_score: float = Field(..., ge=0.0, le=1.0, description="Automation vulnerability [0.0 - 1.0]")
    transferability_score: float = Field(..., ge=0.0, le=1.0, description="Skill portability [0.0 - 1.0]")
    skill_breadth_score: float = Field(..., ge=0.0, le=1.0, description="Domain breadth ratio [0.0 - 1.0]")
    emerging_skill_alignment: float = Field(..., ge=0.0, le=1.0, description="Emerging skill alignment [0.0 - 1.0]")
    skill_gap_score: float = Field(..., ge=0.0, le=1.0, description="Skill gap ratio [0.0 - 1.0]")
    experience_years: float = Field(..., ge=0.0, le=50.0, description="Candidate years of experience")
    target_role_experience_requirement: float = Field(..., ge=0.0, le=15.0, description="Target role expected years")
    experience_gap: float = Field(..., ge=-15.0, le=45.0, description="Experience gap")
    number_of_matching_skills: int = Field(..., ge=0, le=50, description="Count of matching skills")
    number_of_missing_skills: int = Field(..., ge=0, le=50, description="Count of missing skills")
    transition_effort_score: float = Field(..., ge=0.0, le=1.0, description="Normalized transition effort")
    target_role: str = Field(..., description="Target role title")


class ContributingFeature(BaseModel):
    feature: str
    label: str
    value: float
    importance: float


class TransitionReadinessResponse(BaseModel):
    success: bool
    prediction: str
    readiness_score: float
    class_probabilities: Dict[str, float]
    model_version: str
    algorithm: str
    top_contributing_features: List[ContributingFeature]
    disclaimer: str


@app.get("/health")
def health_check():
    return {
        "status": "operational",
        "model_loaded": model_artifact is not None,
        "model_version": model_metadata.get("model_version") if model_metadata else None,
        "algorithm": model_metadata.get("algorithm") if model_metadata else None,
        "feature_count": len(feature_schema.get("features", [])) if feature_schema else 0,
        "uptime_seconds": round(time.time() - startup_time, 1)
    }


@app.get("/model-metadata")
def get_metadata():
    if not model_metadata:
        raise HTTPException(status_code=503, detail="Model metadata is not loaded.")
    return model_metadata


@app.post("/predict-transition-readiness", response_model=TransitionReadinessResponse)
def predict_readiness(req: TransitionReadinessRequest):
    if model_artifact is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    # 1. Encode Target Role
    role_map = feature_schema.get("target_roles", {})
    # Match exact or case-insensitive
    role_encoded = role_map.get(req.target_role)
    if role_encoded is None:
        for r_name, r_idx in role_map.items():
            if r_name.lower().strip() == req.target_role.lower().strip():
                role_encoded = r_idx
                break
    if role_encoded is None:
        role_encoded = 0  # Fallback to base category index

    # 2. Build ordered feature vector strictly conforming to schema
    feature_vector = [
        req.skill_match_score,
        req.market_demand_score,
        req.ai_exposure_score,
        req.transferability_score,
        req.skill_breadth_score,
        req.emerging_skill_alignment,
        req.skill_gap_score,
        req.experience_years,
        req.target_role_experience_requirement,
        req.experience_gap,
        float(req.number_of_matching_skills),
        float(req.number_of_missing_skills),
        req.transition_effort_score,
        float(role_encoded)
    ]

    X = np.array([feature_vector], dtype=np.float32)

    # 3. Model Inference
    pred_idx = int(model_artifact.predict(X)[0])
    probs = model_artifact.predict_proba(X)[0]

    # Map class index to class name
    class_labels = feature_schema.get("class_labels", {0: "high", 1: "low", 2: "moderate"})
    class_labels = {int(k): v for k, v in class_labels.items()}

    class_probs_dict = {}
    for idx, prob in enumerate(probs):
        c_name = class_labels.get(idx, f"class_{idx}")
        class_probs_dict[c_name] = round(float(prob), 4)

    prediction_label = class_labels.get(pred_idx, "moderate")

    # 4. Continuous Transition Readiness Score
    p_low = class_probs_dict.get("low", 0.0)
    p_mod = class_probs_dict.get("moderate", 0.0)
    p_high = class_probs_dict.get("high", 0.0)
    continuous_readiness = round(float((0.15 * p_low) + (0.55 * p_mod) + (0.90 * p_high)), 4)

    # 5. Feature Attribution (Top 3 Influential Features)
    feature_cols = feature_schema.get("features", [])
    importances = model_metadata.get("feature_importances", [])
    
    top_features = []
    for item in importances[:4]:
        f_name = item["feature"]
        val = 0.0
        if f_name == "skill_match_score":
            val = req.skill_match_score
        elif f_name == "skill_gap_score":
            val = req.skill_gap_score
        elif f_name == "number_of_matching_skills":
            val = float(req.number_of_matching_skills)
        elif f_name == "transition_effort_score":
            val = req.transition_effort_score
        elif f_name == "number_of_missing_skills":
            val = float(req.number_of_missing_skills)
        elif f_name == "experience_gap":
            val = req.experience_gap
        elif f_name == "market_demand_score":
            val = req.market_demand_score
        elif f_name == "transferability_score":
            val = req.transferability_score

        top_features.append(ContributingFeature(
            feature=f_name,
            label=FEATURE_HUMAN_LABELS.get(f_name, f_name.replace("_", " ").title()),
            value=round(val, 2),
            importance=item["importance"]
        ))

    return TransitionReadinessResponse(
        success=True,
        prediction=prediction_label,
        readiness_score=continuous_readiness,
        class_probabilities=class_probs_dict,
        model_version=model_metadata.get("model_version", "v1.0.0"),
        algorithm=model_metadata.get("algorithm", "RandomForestClassifier"),
        top_contributing_features=top_features[:3],
        disclaimer="Prototype ML model trained on a competency-based proxy benchmark. This is not a prediction of actual hiring success."
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("service:app", host="127.0.0.1", port=5001, log_level="info")
