# Competency-Based Proxy-Labeled Career Transition Dataset

## Dataset Summary
The **Competency-Based Proxy-Labeled Career Transition Dataset** is a structured tabular benchmark dataset created to train and evaluate the PathForge AI Transition Readiness machine learning model.

It evaluates 1,800 synthetic candidate-to-target-role transitions across 20 tech occupations, combining granular skill match matrices, labor market signals, automation vulnerability indexes, and experience gaps.

---

## CRITICAL ETHICAL & METHODOLOGICAL DISCLOSURES

1. **Synthetic Nature**:
   This dataset is **entirely synthetically generated**. It does NOT contain real individuals, real candidate resumes, or private personal data.
2. **Proxy Labels, NOT Real Hiring Outcomes**:
   The `readiness_label` (`high`, `moderate`, `low`) is a **proxy label** generated from documented multi-factor competency benchmark rules. It does **NOT** represent actual real-world hiring outcomes, interview success rates, or employment verification records.
3. **No Real-World Predictive Validity**:
   Because real-world longitudinal hiring data was not available, **real-world predictive validity has NOT been established**. This model does NOT predict whether an individual will actually be hired by an employer.
4. **Disclosure of Label Circularity / Leakage**:
   The `readiness_label` is mathematically derived from the candidate's skill overlap, experience gap, transferability, and gap effort. Because these same features are supplied as inputs to the Random Forest model, the model is learning the functional relationships and boundary geometry of the PathForge competency benchmark rules rather than external empirical labor market outcomes.

---

## Column Categorization & Feature Breakdown

The dataset contains **17 total columns**, rigorously partitioned as follows:
- **Identifiers (2 columns)**: Not fed to the Random Forest model during inference.
  - `candidate_id`: Unique row instance identifier.
  - `archetype_id`: Grouping key used strictly by `GroupShuffleSplit` to prevent cross-split leakage.
- **Target Label (1 column)**:
  - `readiness_label`: Categorical proxy ground truth (`high`, `moderate`, `low`).
- **Model Input Features (14 features)**:
  1. `skill_match_score`: Direct competency overlap ratio [0.0 - 1.0]
  2. `market_demand_score`: Normalized labor demand index for candidate's skills [0.0 - 1.0]
  3. `ai_exposure_score`: Empirical automation vulnerability index [0.0 - 1.0]
  4. `transferability_score`: Cross-domain portability index [0.0 - 1.0]
  5. `skill_breadth_score`: Breadth ratio across tech disciplines [0.0 - 1.0]
  6. `emerging_skill_alignment`: Presence of modern frontier technologies [0.0 - 1.0]
  7. `skill_gap_score`: Ratio of missing critical core competencies [0.0 - 1.0]
  8. `experience_years`: Candidate's years of professional experience [0.0 - 30.0]
  9. `target_role_experience_requirement`: Baseline years expected for target role level [1.0 - 8.0]
  10. `experience_gap`: Candidate experience minus role requirement [-8.0 - 25.0]
  11. `number_of_matching_skills`: Count of already possessed skills matching target role [0 - 30]
  12. `number_of_missing_skills`: Count of missing skills required for target role [0 - 25]
  13. `transition_effort_score`: Normalized upskilling effort based on study weeks required [0.0 - 1.0]
  14. `target_role_encoded`: Categorical encoding (0 to 19) mapping the candidate's chosen target occupation among PathForge's 20 defined roles.

---

## Dataset Schema Table

| Column | Category | Type | Description |
|---|---|---|---|
| `candidate_id` | Identifier | string | Unique synthetic candidate instance ID |
| `archetype_id` | Identifier | string | Base persona identifier (30 total) used for non-leaking grouped train/test splitting |
| `target_role` | Model Feature (Encoded) | string | The target tech occupation among the 20 PathForge target roles (encoded as `target_role_encoded` in model) |
| `skill_match_score` | Model Feature | float [0.0 - 1.0] | Direct competency overlap ratio |
| `market_demand_score` | Model Feature | float [0.0 - 1.0] | Normalized labor demand index for candidate's skills |
| `ai_exposure_score` | Model Feature | float [0.0 - 1.0] | Empirical automation vulnerability index |
| `transferability_score` | Model Feature | float [0.0 - 1.0] | Cross-domain portability index |
| `skill_breadth_score` | Model Feature | float [0.0 - 1.0] | Breadth ratio across tech disciplines |
| `emerging_skill_alignment` | Model Feature | float [0.0 - 1.0] | Presence of modern frontier technologies |
| `skill_gap_score` | Model Feature | float [0.0 - 1.0] | Ratio of missing critical core competencies |
| `experience_years` | Model Feature | float [0.0 - 30.0] | Candidate's years of professional experience |
| `target_role_experience_requirement` | Model Feature | float [1.0 - 8.0] | Baseline years expected for target role level |
| `experience_gap` | Model Feature | float [-8.0 - 25.0] | `experience_years - target_role_experience_requirement` |
| `number_of_matching_skills` | Model Feature | int [0 - 30] | Count of already possessed skills matching target role |
| `number_of_missing_skills` | Model Feature | int [0 - 25] | Count of missing skills required for target role |
| `transition_effort_score` | Model Feature | float [0.0 - 1.0] | Normalized upskilling effort based on weeks required |
| `readiness_label` | Target Label | categorical | Ground truth proxy class: `high`, `moderate`, `low` |

---

## Proxy Labeling Methodology

A composite readiness index $R \in [0.0, 1.0]$ is computed deterministically:
$$R = (0.45 \times \text{skill\_match\_score}) + (0.20 \times \text{transferability\_score}) + (0.15 \times \text{exp\_factor}) + (0.10 \times \text{market\_demand\_score}) - (0.10 \times \text{transition\_effort\_score})$$
where $\text{exp\_factor} = \min(1.0, \max(0.0, (\text{experience\_gap} + 3.0) / 6.0))$.

The discrete proxy classes are assigned as follows:
- **`high`**: $R \ge 0.68$ **AND** $\text{skill\_gap\_score} \le 0.35$ **AND** $\text{experience\_gap} \ge -1.0$ (experience within 1 year of target requirement).
- **`moderate`**: $R \ge 0.42$ **AND** $\text{skill\_gap\_score} \le 0.65$ **AND** $\text{experience\_gap} \ge -3.0$.
- **`low`**: All remaining transition pairs failing the moderate criteria.

---

## Train/Test Splitting Protocol (Zero Leakage)
To prevent synthetic archetype patterns from leaking across splits, records are partitioned using `GroupShuffleSplit` on `archetype_id`:
- **Train Set (80%)**: 24 candidate archetypes (~1,440 rows).
- **Test Set (20%)**: 6 completely held-out candidate archetypes (~360 rows).
No variation of any candidate in the test set ever appeared during training.
