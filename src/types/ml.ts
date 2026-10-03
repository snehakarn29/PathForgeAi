export interface MLTransitionFeatureInput {
  skill_match_score: number;
  market_demand_score: number;
  ai_exposure_score: number;
  transferability_score: number;
  skill_breadth_score: number;
  emerging_skill_alignment: number;
  skill_gap_score: number;
  experience_years: number;
  target_role_experience_requirement: number;
  experience_gap: number;
  number_of_matching_skills: number;
  number_of_missing_skills: number;
  transition_effort_score: number;
  target_role: string;
}

export interface MLContributingFeature {
  feature: string;
  label: string;
  value: number;
  importance: number;
}

export interface MLTransitionPrediction {
  available: boolean;
  prediction?: 'high' | 'moderate' | 'low';
  readiness_score?: number; // e.g. 0.82 (82%)
  class_probabilities?: {
    low: number;
    moderate: number;
    high: number;
  };
  model_version?: string;
  algorithm?: string;
  top_contributing_features?: MLContributingFeature[];
  disclaimer?: string;
  reason?: string;
  latency_ms?: number;
}

export interface MLModelMetadata {
  model_version: string;
  algorithm: string;
  hyperparameters: {
    n_estimators: number;
    max_depth: number;
    min_samples_split: number;
    min_samples_leaf: number;
    random_state: number;
    class_weight: string;
  };
  dataset_metadata: {
    dataset_type: string;
    dataset_filename: string;
    dataset_sha256: string;
    total_rows: number;
    train_rows: number;
    test_rows: number;
    train_archetypes_count: number;
    test_archetypes_count: number;
    split_method: string;
  };
  evaluation_metrics: {
    test_accuracy: number;
    test_precision_macro: number;
    test_recall_macro: number;
    test_f1_macro: number;
    test_f1_weighted: number;
    test_roc_auc_ovr_macro?: number;
    confusion_matrix: number[][];
    class_labels: string[];
    classification_report?: Record<string, any>;
  };
  feature_importances: Array<{ feature: string; importance: number }>;
  trained_at: string;
  disclaimer: string;
}
