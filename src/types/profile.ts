export interface EducationItem {
  degree: string;
  fieldOfStudy?: string;
  institution: string;
  year?: string;
  grade?: string;
}

export interface WorkExperienceItem {
  company: string;
  role: string;
  duration: string;
  location?: string;
  responsibilities: string[];
}

export interface ProjectItem {
  name: string;
  technologies: string[];
  description: string;
  url?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year?: string;
  credentialId?: string;
}

export interface UserProfile {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  currentRole: string | null;
  yearsOfExperience: number | null;
  location: string | null;
  summary?: string | null;
  previousRoles?: string[];
  industries?: string[];
  education: EducationItem[];
  skills: string[];
  technicalSkills: string[];
  softSkills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  workExperience: WorkExperienceItem[];
  careerInterests: string[];
  domains: string[];
  tools: string[];
  languages: string[];
  achievements: string[];
  createdAt: string;
  updatedAt: string;
  extractionSource: 'gemini' | 'fallback' | 'manual' | 'demo';
  extractionConfidence?: number;
  extractionError?: string;
}

export interface ResumeMeta {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  rawTextLength: number;
}
