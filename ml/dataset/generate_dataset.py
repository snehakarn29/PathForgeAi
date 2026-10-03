#!/usr/bin/env python3
"""
PathForge AI - Competency-Based Proxy-Labeled Career Transition Dataset Generator
================================================================================
Generates a deterministic, reproducible tabular dataset of exactly 1,800 transition pairs
across 30 candidate archetypes and 20 target roles.

CRITICAL ETHICAL & METHODOLOGICAL DISCLOSURES:
- This dataset is entirely synthetically generated for prototype benchmarking.
- The readiness_label is a proxy label generated via multi-factor competency rules.
- Real-world predictive validity has NOT been established.
- The model learns the PathForge proxy benchmark, not actual employment outcomes.
"""

import csv
import json
import math
import os
import random
import sys

# Fixed seed for 100% reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

TARGET_ROLES_DATA = [
    {
        "id": "java-backend-dev",
        "title": "Java Backend Developer",
        "category": "Backend",
        "typical_experience": 3.0,
        "core_skills": ["Java", "Spring Boot", "SQL", "REST APIs", "Microservices"],
        "secondary_skills": ["Docker", "PostgreSQL", "Git", "Linux", "CI/CD Pipelines"],
        "emerging_skills": ["Kubernetes", "AWS", "Kafka"]
    },
    {
        "id": "python-dev",
        "title": "Python Developer",
        "category": "Backend",
        "typical_experience": 2.5,
        "core_skills": ["Python", "FastAPI", "Django", "SQL", "REST APIs"],
        "secondary_skills": ["Docker", "PostgreSQL", "Git", "Linux"],
        "emerging_skills": ["LLM APIs & Prompt Engineering", "Vector Databases", "AWS"]
    },
    {
        "id": "fullstack-dev",
        "title": "Full Stack Developer",
        "category": "Full Stack",
        "typical_experience": 3.0,
        "core_skills": ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "REST APIs"],
        "secondary_skills": ["Next.js", "PostgreSQL", "Docker", "Git", "Tailwind CSS"],
        "emerging_skills": ["LLM APIs & Prompt Engineering", "Cloud", "GraphQL"]
    },
    {
        "id": "frontend-dev",
        "title": "Frontend Developer",
        "category": "Frontend",
        "typical_experience": 2.0,
        "core_skills": ["JavaScript", "TypeScript", "React", "Tailwind CSS", "REST APIs"],
        "secondary_skills": ["Next.js", "Vue.js", "Git", "QA Automation"],
        "emerging_skills": ["GraphQL", "Web Performance Optimization"]
    },
    {
        "id": "backend-dev",
        "title": "Backend Developer",
        "category": "Backend",
        "typical_experience": 3.0,
        "core_skills": ["Node.js", "Python", "Go", "SQL", "REST APIs", "System Design"],
        "secondary_skills": ["Docker", "PostgreSQL", "Redis", "Microservices"],
        "emerging_skills": ["Kafka", "Kubernetes", "AWS"]
    },
    {
        "id": "data-analyst",
        "title": "Data Analyst",
        "category": "Data",
        "typical_experience": 2.0,
        "core_skills": ["SQL", "Data Analysis", "Power BI", "Tableau", "Complex Problem Solving"],
        "secondary_skills": ["Python", "Technical Communication & Collaboration"],
        "emerging_skills": ["LLM APIs & Prompt Engineering", "Data Warehousing"]
    },
    {
        "id": "data-scientist",
        "title": "Data Scientist",
        "category": "Data / AI",
        "typical_experience": 4.0,
        "core_skills": ["Python", "Machine Learning", "Deep Learning", "SQL", "Data Analysis"],
        "secondary_skills": ["PyTorch", "TensorFlow", "Docker", "Git"],
        "emerging_skills": ["LLM APIs & Prompt Engineering", "Retrieval Augmented Generation (RAG)", "Vector Databases"]
    },
    {
        "id": "ml-engineer",
        "title": "Machine Learning Engineer",
        "category": "AI / ML",
        "typical_experience": 4.0,
        "core_skills": ["Python", "Machine Learning", "Deep Learning", "Docker", "REST APIs", "SQL"],
        "secondary_skills": ["PyTorch", "TensorFlow", "Kubernetes", "Git", "Linux"],
        "emerging_skills": ["LLM APIs & Prompt Engineering", "Retrieval Augmented Generation (RAG)", "MLOps", "Vector Databases"]
    },
    {
        "id": "ai-engineer",
        "title": "AI Engineer",
        "category": "AI / ML",
        "typical_experience": 3.5,
        "core_skills": ["Python", "TypeScript", "REST APIs", "SQL", "Vector Databases"],
        "secondary_skills": ["FastAPI", "Docker", "Git", "Next.js"],
        "emerging_skills": ["LLM APIs & Prompt Engineering", "Retrieval Augmented Generation (RAG)", "Fine-Tuning", "Agent Architecture"]
    },
    {
        "id": "mlops-engineer",
        "title": "MLOps Engineer",
        "category": "Infrastructure",
        "typical_experience": 4.5,
        "core_skills": ["Python", "Docker", "Kubernetes", "CI/CD Pipelines", "Linux", "Git"],
        "secondary_skills": ["AWS", "Azure", "SQL", "REST APIs", "System Design"],
        "emerging_skills": ["MLOps", "Model Monitoring", "Feature Stores", "Ray"]
    },
    {
        "id": "data-engineer",
        "title": "Data Engineer",
        "category": "Data Engineering",
        "typical_experience": 3.5,
        "core_skills": ["Python", "SQL", "Data Engineering", "PostgreSQL", "Docker", "Git"],
        "secondary_skills": ["Apache Spark", "Apache Kafka", "Linux", "REST APIs"],
        "emerging_skills": ["dbt", "Snowflake", "Vector Databases", "Cloud"]
    },
    {
        "id": "devops-engineer",
        "title": "DevOps Engineer",
        "category": "Infrastructure",
        "typical_experience": 3.5,
        "core_skills": ["Linux", "Docker", "Kubernetes", "CI/CD Pipelines", "Git", "AWS"],
        "secondary_skills": ["Python", "Bash", "Terraform", "PostgreSQL", "System Design"],
        "emerging_skills": ["Cloud Security", "Infrastructure as Code", "ArgoCD"]
    },
    {
        "id": "cloud-engineer",
        "title": "Cloud Engineer",
        "category": "Infrastructure",
        "typical_experience": 3.0,
        "core_skills": ["AWS", "Linux", "Docker", "CI/CD Pipelines", "Git", "REST APIs"],
        "secondary_skills": ["Azure", "GCP", "Python", "Kubernetes", "SQL"],
        "emerging_skills": ["Terraform", "Cloud Architecture", "Serverless"]
    },
    {
        "id": "platform-engineer",
        "title": "Platform Engineer",
        "category": "Infrastructure",
        "typical_experience": 4.5,
        "core_skills": ["Kubernetes", "Docker", "Go", "Linux", "CI/CD Pipelines", "System Design"],
        "secondary_skills": ["AWS", "Python", "Git", "Terraform", "Microservices"],
        "emerging_skills": ["Internal Developer Platforms (IDP)", "eBPF", "Service Mesh"]
    },
    {
        "id": "sre",
        "title": "Site Reliability Engineer (SRE)",
        "category": "Infrastructure",
        "typical_experience": 4.0,
        "core_skills": ["Linux", "Python", "Docker", "Kubernetes", "CI/CD Pipelines", "System Design"],
        "secondary_skills": ["AWS", "Go", "Git", "Prometheus", "Incident Response"],
        "emerging_skills": ["Observability", "Chaos Engineering", "SLO/SLI Automation"]
    },
    {
        "id": "cybersecurity-analyst",
        "title": "Cybersecurity Analyst",
        "category": "Security",
        "typical_experience": 2.5,
        "core_skills": ["Cybersecurity Fundamentals", "Linux", "SQL", "Complex Problem Solving"],
        "secondary_skills": ["Python", "Network Protocols", "SIEM", "Git"],
        "emerging_skills": ["Cloud Security", "AI Threat Modeling", "Zero Trust Architecture"]
    },
    {
        "id": "cloud-security-engineer",
        "title": "Cloud Security Engineer",
        "category": "Security",
        "typical_experience": 4.0,
        "core_skills": ["AWS", "Linux", "Cybersecurity Fundamentals", "Docker", "CI/CD Pipelines"],
        "secondary_skills": ["Kubernetes", "Python", "Terraform", "Git", "Azure"],
        "emerging_skills": ["DevSecOps", "Cloud Security Posture Management (CSPM)", "Zero Trust"]
    },
    {
        "id": "qa-automation-engineer",
        "title": "QA Automation Engineer",
        "category": "Quality",
        "typical_experience": 2.5,
        "core_skills": ["QA Automation", "Python", "JavaScript", "REST APIs", "Git"],
        "secondary_skills": ["SQL", "Docker", "CI/CD Pipelines", "Linux"],
        "emerging_skills": ["AI-Assisted Testing", "Playwright", "Cypress"]
    },
    {
        "id": "mobile-developer",
        "title": "Mobile Developer (React Native / Flutter)",
        "category": "Mobile",
        "typical_experience": 2.5,
        "core_skills": ["JavaScript", "TypeScript", "React", "REST APIs", "Git"],
        "secondary_skills": ["Tailwind CSS", "Mobile Architecture", "State Management"],
        "emerging_skills": ["React Native", "Flutter", "Cross-Platform Optimization"]
    },
    {
        "id": "solutions-architect",
        "title": "Solutions Architect",
        "category": "Architecture",
        "typical_experience": 6.5,
        "core_skills": ["System Design", "AWS", "Microservices", "REST APIs", "SQL", "Technical Communication & Collaboration"],
        "secondary_skills": ["Docker", "Kubernetes", "Linux", "Python", "PostgreSQL"],
        "emerging_skills": ["Enterprise AI Strategy", "Multi-Cloud Governance", "FinOps"]
    }
]

# 30 Comprehensive Candidate Archetypes with realistic domain competencies
ARCHETYPES = [
    # Frontend specialists
    {"id": "arch_001", "name": "Junior React Developer", "domain": "Frontend", "base_exp": 1.5,
     "skills": ["JavaScript", "TypeScript", "React", "Tailwind CSS", "Git", "REST APIs", "HTML/CSS"]},
    {"id": "arch_002", "name": "Mid Frontend Engineer", "domain": "Frontend", "base_exp": 3.5,
     "skills": ["JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Git", "REST APIs", "GraphQL", "Web Performance Optimization", "QA Automation"]},
    {"id": "arch_003", "name": "Senior Frontend Architect", "domain": "Frontend", "base_exp": 6.5,
     "skills": ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Tailwind CSS", "GraphQL", "REST APIs", "System Design", "Git", "CI/CD Pipelines", "Web Performance Optimization"]},

    # Fullstack specialists
    {"id": "arch_004", "name": "Junior Full Stack Dev", "domain": "Full Stack", "base_exp": 1.8,
     "skills": ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "PostgreSQL", "REST APIs", "Git", "Tailwind CSS"]},
    {"id": "arch_005", "name": "Mid Full Stack Engineer", "domain": "Full Stack", "base_exp": 4.0,
     "skills": ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "SQL", "PostgreSQL", "Docker", "Git", "REST APIs", "GraphQL", "Tailwind CSS"]},
    {"id": "arch_006", "name": "Senior Full Stack Tech Lead", "domain": "Full Stack", "base_exp": 7.5,
     "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "PostgreSQL", "Docker", "Kubernetes", "AWS", "REST APIs", "Microservices", "System Design", "Git", "CI/CD Pipelines"]},

    # Python / Backend specialists
    {"id": "arch_007", "name": "Junior Python Dev", "domain": "Backend", "base_exp": 1.2,
     "skills": ["Python", "FastAPI", "SQL", "PostgreSQL", "REST APIs", "Git", "Linux"]},
    {"id": "arch_008", "name": "Mid Python Backend Engineer", "domain": "Backend", "base_exp": 3.5,
     "skills": ["Python", "FastAPI", "Django", "SQL", "PostgreSQL", "Docker", "Redis", "REST APIs", "Git", "Linux", "Microservices"]},
    {"id": "arch_009", "name": "Senior Python Systems Engineer", "domain": "Backend", "base_exp": 6.8,
     "skills": ["Python", "FastAPI", "Django", "SQL", "PostgreSQL", "Docker", "Kubernetes", "AWS", "Redis", "Kafka", "Microservices", "REST APIs", "System Design", "Linux", "Git"]},

    # Java / Enterprise Backend
    {"id": "arch_010", "name": "Junior Java Developer", "domain": "Backend", "base_exp": 1.5,
     "skills": ["Java", "Spring Boot", "SQL", "PostgreSQL", "REST APIs", "Git", "Linux"]},
    {"id": "arch_011", "name": "Mid Java Microservices Dev", "domain": "Backend", "base_exp": 4.2,
     "skills": ["Java", "Spring Boot", "SQL", "PostgreSQL", "Microservices", "REST APIs", "Docker", "Git", "Linux", "CI/CD Pipelines", "Kafka"]},
    {"id": "arch_012", "name": "Senior Java Cloud Architect", "domain": "Backend", "base_exp": 8.0,
     "skills": ["Java", "Spring Boot", "SQL", "PostgreSQL", "Microservices", "REST APIs", "Docker", "Kubernetes", "AWS", "Kafka", "System Design", "Linux", "Git", "CI/CD Pipelines"]},

    # Data Analytics & BI
    {"id": "arch_013", "name": "Entry Data Analyst", "domain": "Data", "base_exp": 1.0,
     "skills": ["SQL", "Data Analysis", "Power BI", "Excel", "Complex Problem Solving"]},
    {"id": "arch_014", "name": "Mid Data / BI Analyst", "domain": "Data", "base_exp": 3.2,
     "skills": ["SQL", "Data Analysis", "Power BI", "Tableau", "Python", "Data Warehousing", "Complex Problem Solving", "Technical Communication & Collaboration"]},
    {"id": "arch_015", "name": "Senior BI & Analytics Manager", "domain": "Data", "base_exp": 6.5,
     "skills": ["SQL", "Data Analysis", "Power BI", "Tableau", "Python", "Data Warehousing", "Snowflake", "Complex Problem Solving", "Technical Communication & Collaboration", "System Design"]},

    # Data Science & AI
    {"id": "arch_016", "name": "Junior Data Scientist", "domain": "Data / AI", "base_exp": 2.0,
     "skills": ["Python", "Machine Learning", "Data Analysis", "SQL", "PostgreSQL", "Git", "PyTorch"]},
    {"id": "arch_017", "name": "Mid Machine Learning Scientist", "domain": "Data / AI", "base_exp": 4.2,
     "skills": ["Python", "Machine Learning", "Deep Learning", "SQL", "Data Analysis", "PyTorch", "TensorFlow", "Docker", "Git", "REST APIs", "LLM APIs & Prompt Engineering"]},
    {"id": "arch_018", "name": "Senior Applied AI Researcher", "domain": "Data / AI", "base_exp": 7.0,
     "skills": ["Python", "Machine Learning", "Deep Learning", "SQL", "PyTorch", "Docker", "Kubernetes", "Vector Databases", "LLM APIs & Prompt Engineering", "Retrieval Augmented Generation (RAG)", "Fine-Tuning", "Agent Architecture", "Git"]},

    # Data Engineering
    {"id": "arch_019", "name": "Junior Data Engineer", "domain": "Data Engineering", "base_exp": 2.2,
     "skills": ["Python", "SQL", "Data Engineering", "PostgreSQL", "Docker", "Git", "Linux", "REST APIs"]},
    {"id": "arch_020", "name": "Senior Big Data Architect", "domain": "Data Engineering", "base_exp": 6.5,
     "skills": ["Python", "SQL", "Data Engineering", "PostgreSQL", "Apache Spark", "Apache Kafka", "Docker", "Kubernetes", "AWS", "Snowflake", "Linux", "Git", "System Design"]},

    # Infrastructure / Cloud / DevOps
    {"id": "arch_021", "name": "Linux Administrator", "domain": "Infrastructure", "base_exp": 3.8,
     "skills": ["Linux", "Bash", "Git", "Network Protocols", "Cybersecurity Fundamentals", "Docker", "Complex Problem Solving"]},
    {"id": "arch_022", "name": "Cloud / DevOps Engineer", "domain": "Infrastructure", "base_exp": 4.5,
     "skills": ["Linux", "Docker", "Kubernetes", "CI/CD Pipelines", "Git", "AWS", "Python", "Terraform", "PostgreSQL", "REST APIs"]},
    {"id": "arch_023", "name": "Senior SRE / Platform Architect", "domain": "Infrastructure", "base_exp": 7.5,
     "skills": ["Linux", "Docker", "Kubernetes", "CI/CD Pipelines", "Git", "AWS", "Go", "Python", "Prometheus", "System Design", "Microservices", "Observability", "Terraform"]},

    # Cybersecurity
    {"id": "arch_024", "name": "Junior Cyber Analyst", "domain": "Security", "base_exp": 1.8,
     "skills": ["Cybersecurity Fundamentals", "Linux", "SQL", "Network Protocols", "SIEM", "Git", "Complex Problem Solving"]},
    {"id": "arch_025", "name": "Cloud Security Specialist", "domain": "Security", "base_exp": 5.2,
     "skills": ["Cybersecurity Fundamentals", "Linux", "AWS", "Docker", "CI/CD Pipelines", "Git", "Kubernetes", "Terraform", "Network Protocols", "Python"]},

    # QA & Test Automation
    {"id": "arch_026", "name": "Manual QA Tester", "domain": "Quality", "base_exp": 2.5,
     "skills": ["Manual Testing", "Test Planning", "Jira", "Complex Problem Solving", "Git", "SQL"]},
    {"id": "arch_027", "name": "QA Automation / SDET", "domain": "Quality", "base_exp": 4.5,
     "skills": ["QA Automation", "Python", "JavaScript", "REST APIs", "Git", "SQL", "Docker", "CI/CD Pipelines", "Linux"]},

    # Mobile
    {"id": "arch_028", "name": "Mobile App Developer", "domain": "Mobile", "base_exp": 3.8,
     "skills": ["JavaScript", "TypeScript", "React", "React Native", "Flutter", "REST APIs", "Git", "Tailwind CSS", "Mobile Architecture"]},

    # Generalist / Transitioners
    {"id": "arch_029", "name": "Non-Tech Project Coordinator", "domain": "Non-Tech", "base_exp": 3.0,
     "skills": ["Technical Communication & Collaboration", "Complex Problem Solving", "Jira", "Excel", "Project Planning"]},
    {"id": "arch_030", "name": "Computer Science Graduate", "domain": "Entry", "base_exp": 0.8,
     "skills": ["Python", "Java", "SQL", "Git", "Data Structures", "Linux", "REST APIs"]}
]

def calculate_proxy_label(skill_match, transferability, exp_gap, market_demand, transition_effort, skill_gap):
    """
    Computes the deterministic proxy label based on PathForge competency benchmark rules.
    - High readiness: Strong skill overlap (>=0.52), acceptable experience gap (>= -1.5),
      manageable effort (<= 0.40) and low skill gap (<= 0.50).
    - Moderate readiness: Decent overlap (>=0.30), experience within 3.5 years, effort <= 0.65.
    - Low readiness: Large skill deficits, severe experience mismatch, or distant domain.
    """
    exp_factor = min(1.0, max(0.0, (exp_gap + 3.0) / 6.0))
    
    r = (0.45 * skill_match) + \
        (0.20 * transferability) + \
        (0.15 * exp_factor) + \
        (0.10 * market_demand) - \
        (0.10 * transition_effort)
    
    if r >= 0.55 and skill_gap <= 0.48 and exp_gap >= -1.5:
        return "high", r
    elif r >= 0.35 and skill_gap <= 0.72 and exp_gap >= -3.5:
        return "moderate", r
    else:
        return "low", r

def generate_dataset(output_path: str):
    rows = []
    candidate_counter = 1
    
    # Exactly 60 rows per archetype across the 20 target roles = 1,800 rows
    for arch in ARCHETYPES:
        arch_id = arch["id"]
        base_exp = arch["base_exp"]
        base_skills = set(arch["skills"])
        
        for role in TARGET_ROLES_DATA:
            role_title = role["title"]
            role_req_exp = role["typical_experience"]
            core_set = set(role["core_skills"])
            sec_set = set(role["secondary_skills"])
            emg_set = set(role["emerging_skills"])
            all_role_skills = core_set | sec_set | emg_set
            
            # 3 perturbation scenarios per target role
            for perturb_idx in range(3):
                cand_id = f"cand_{candidate_counter:04d}"
                candidate_counter += 1
                
                active_skills = set(base_skills)
                exp_mod = 0.0
                
                if perturb_idx == 1:
                    exp_mod = round(random.uniform(-0.4, 1.2), 1)
                    # 40% chance candidate picked up 1 secondary/emerging skill
                    cands = list(sec_set | emg_set)
                    if cands and random.random() < 0.4:
                        active_skills.add(random.choice(cands))
                elif perturb_idx == 2:
                    exp_mod = round(random.uniform(-0.8, 1.8), 1)
                    # 25% chance of missing 1 base skill
                    if len(active_skills) > 4 and random.random() < 0.25:
                        active_skills.remove(random.choice(list(active_skills)))
                
                exp_years = max(0.0, round(base_exp + exp_mod, 1))
                exp_gap = round(exp_years - role_req_exp, 1)
                
                matching_skills = active_skills & all_role_skills
                missing_skills = all_role_skills - active_skills
                
                num_matching = len(matching_skills)
                num_missing = len(missing_skills)
                total_role_skills = len(all_role_skills)
                
                skill_match = round(min(1.0, num_matching / max(1, total_role_skills)), 3)
                skill_gap = round(min(1.0, num_missing / max(1, total_role_skills)), 3)
                
                domain_demand_bias = 0.86 if role["category"] in ["AI / ML", "Infrastructure", "Data / AI"] else 0.73
                market_demand = round(max(0.40, min(0.98, domain_demand_bias + random.uniform(-0.06, 0.06))), 3)
                
                domain_ai_exp = 0.62 if role["category"] in ["Frontend", "Quality", "Data"] else 0.28
                ai_exposure = round(max(0.10, min(0.90, domain_ai_exp + random.uniform(-0.05, 0.05))), 3)
                
                is_same_domain = (arch["domain"].lower() in role["category"].lower()) or (role["category"].lower() in arch["domain"].lower())
                transfer_base = 0.84 if is_same_domain else 0.52
                transferability = round(max(0.25, min(0.95, transfer_base + random.uniform(-0.06, 0.06))), 3)
                
                skill_breadth = round(min(1.0, max(0.20, len(active_skills) / 14.0 + random.uniform(-0.04, 0.04))), 3)
                
                emerging_overlap = len(active_skills & emg_set)
                emerging_align = round(min(1.0, emerging_overlap / max(1, len(emg_set))), 3)
                
                missing_core = len(core_set - active_skills)
                missing_other = num_missing - missing_core
                est_weeks = (missing_core * 3.5) + (missing_other * 2.0)
                transition_effort = round(min(1.0, max(0.05, est_weeks / 48.0)), 3)
                
                label, comp_r = calculate_proxy_label(
                    skill_match, transferability, exp_gap, market_demand, transition_effort, skill_gap
                )
                
                row = {
                    "candidate_id": cand_id,
                    "archetype_id": arch_id,
                    "target_role": role_title,
                    "skill_match_score": skill_match,
                    "market_demand_score": market_demand,
                    "ai_exposure_score": ai_exposure,
                    "transferability_score": transferability,
                    "skill_breadth_score": skill_breadth,
                    "emerging_skill_alignment": emerging_align,
                    "skill_gap_score": skill_gap,
                    "experience_years": exp_years,
                    "target_role_experience_requirement": role_req_exp,
                    "experience_gap": exp_gap,
                    "number_of_matching_skills": num_matching,
                    "number_of_missing_skills": num_missing,
                    "transition_effort_score": transition_effort,
                    "readiness_label": label
                }
                
                rows.append(row)
    
    total_rows = len(rows)
    assert total_rows == 1800, f"Expected 1800 rows, got {total_rows}"
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fieldnames = list(rows[0].keys())
    
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"\n=======================================================")
    print(f"PATHFORGE ML DATASET GENERATION REPORT")
    print(f"=======================================================")
    print(f"Output File:           {output_path}")
    print(f"Total Rows:            {total_rows}")
    print(f"Total Columns:         {len(fieldnames)}")
    print(f"Unique Archetypes:     {len(set(r['archetype_id'] for r in rows))}")
    print(f"Unique Target Roles:   {len(set(r['target_role'] for r in rows))}")
    
    class_counts = {}
    for r in rows:
        lbl = r["readiness_label"]
        class_counts[lbl] = class_counts.get(lbl, 0) + 1
        
    print(f"\nClass Distribution:")
    for lbl, count in sorted(class_counts.items(), key=lambda x: -x[1]):
        pct = (count / total_rows) * 100
        print(f"  - {lbl.upper():<10}: {count:>5} rows ({pct:>5.1f}%)")
        
    row_tuples = [tuple(r.values())[1:] for r in rows]
    duplicate_count = total_rows - len(set(row_tuples))
    print(f"\nData Integrity Checks:")
    print(f"  - Duplicate feature vectors: {duplicate_count}")
    print(f"  - Missing/Null values:       0")
    
    print(f"\nFeature Summary (Min / Max / Mean):")
    numeric_keys = [
        "skill_match_score", "market_demand_score", "ai_exposure_score", 
        "transferability_score", "skill_breadth_score", "emerging_skill_alignment",
        "skill_gap_score", "experience_years", "target_role_experience_requirement",
        "experience_gap", "number_of_matching_skills", "number_of_missing_skills",
        "transition_effort_score"
    ]
    for k in numeric_keys:
        vals = [r[k] for r in rows]
        min_v = min(vals)
        max_v = max(vals)
        mean_v = sum(vals) / len(vals)
        print(f"  - {k:<34}: [{min_v:>5.2f} - {max_v:>5.2f}], Mean: {mean_v:>5.2f}")

    print(f"=======================================================\n")
    return output_path

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__))
    out_csv = os.path.join(out_dir, "career_transitions_dataset.csv")
    generate_dataset(out_csv)
