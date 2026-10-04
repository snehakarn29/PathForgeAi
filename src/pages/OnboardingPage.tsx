import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Cpu,
  Sparkles,
  Info,
  X,
  ClipboardPaste,
  Layers,
  Database,
  GitBranch,
  BrainCircuit,
  Zap,
  Check
} from 'lucide-react';
import { UserProfile, ResumeMeta } from '../types/profile.ts';
import { StorageService } from '../services/storageService.ts';
import { ResumeIngestionPortal3D } from '../components/three/ResumeIngestionPortal3D.tsx';

interface OnboardingPageProps {
  onProfileExtracted: (profile: UserProfile, meta?: ResumeMeta) => void;
  onNavigate: (route: string) => void;
}

const SAMPLE_RESUMES = [
  {
    id: 'fullstack',
    title: 'Senior Full-Stack Engineer',
    exp: '5 Years Experience',
    skills: 'TypeScript, React, Node.js, Next.js, PostgreSQL, Docker, AWS, GraphQL',
    text: `Alex Chen
Email: alex.chen@example.com | Phone: (555) 234-5678 | San Francisco, CA
Senior Full-Stack Software Engineer with 5+ years of experience architecting distributed cloud web platforms.

SUMMARY
Versatile engineer specializing in full-stack TypeScript, React SPA/SSR architectures, and microservices on Node.js and AWS. Proven track record leading frontend migration to modern components and optimizing relational queries in PostgreSQL.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Express, Node.js, Tailwind CSS, Redux, GraphQL
Cloud & DevOps: AWS (ECS, S3, RDS, Lambda), Docker, CI/CD, Git, GitHub Actions, Redis
Databases: PostgreSQL, MongoDB, Redis

WORK EXPERIENCE
Senior Full-Stack Engineer | CloudNova Solutions (2022 - Present)
- Architected high-concurrency microservices in Node.js/TypeScript reducing API latency by 35%.
- Built responsive client dashboards in React and Tailwind CSS serving 120k daily active users.
- Automated Docker containerization and CI/CD pipelines to AWS ECS.

Full-Stack Developer | Horizon Data Labs (2019 - 2022)
- Developed RESTful APIs and React interfaces for data visualization dashboards.
- Refactored PostgreSQL queries and indexed tables, cutting report run times from 14s to 1.8s.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2019)`
  },
  {
    id: 'datascience',
    title: 'Data Scientist & ML Engineer',
    exp: '4 Years Experience',
    skills: 'Python, PyTorch, Scikit-Learn, SQL, Pandas, FastAPI, Docker, ML Pipelines',
    text: `Dr. Maya Patel
Email: maya.patel@example.com | Phone: (555) 876-5432 | Boston, MA
Data Scientist & Machine Learning Specialist with 4 years of applied industry ML experience.

SUMMARY
Machine Learning Engineer with strong mathematical foundations in predictive modeling, feature engineering, and MLOps. Hands-on experience developing Random Forest, Gradient Boosting, and deep learning models for classification and transition prediction.

TECHNICAL SKILLS
Languages: Python, SQL, R, Bash
ML & Data: Scikit-Learn, PyTorch, TensorFlow, Pandas, NumPy, XGBoost, Matplotlib, Seaborn
Engineering: FastAPI, Docker, Git, MLflow, AWS S3, Jupyter, REST APIs

EXPERIENCE
Machine Learning Engineer | Apex Analytics (2021 - Present)
- Engineered feature pipelines and trained Random Forest classifiers achieving 96% macro F1 score.
- Deployed inference microservices using FastAPI and containerized in Docker.
- Monitored model drift and prediction confidence calibration in production.

Data Scientist | BioMetric Insights (2020 - 2021)
- Conducted exploratory data analysis on 2M+ records using Pandas, SQL, and Scikit-Learn.
- Built automated model evaluation benchmark suites calculating precision, recall, and ROC-AUC.

EDUCATION
M.S. in Data Science & Machine Learning | MIT (2020)
B.S. in Applied Mathematics | Carnegie Mellon University (2018)`
  },
  {
    id: 'devops',
    title: 'Cloud & DevOps Platform Engineer',
    exp: '6 Years Experience',
    skills: 'Kubernetes, Terraform, AWS, Docker, Linux, CI/CD, Python, Prometheus',
    text: `Marcus Brody
Email: marcus.brody@example.com | Phone: (555) 432-1098 | Austin, TX
DevOps & Cloud Infrastructure Engineer with 6 years of experience building resilient production platforms.

SUMMARY
Infrastructure engineer focused on Kubernetes cluster management, Infrastructure as Code with Terraform, and zero-downtime deployment pipelines across AWS.

TECHNICAL SKILLS
Cloud: AWS (EKS, VPC, IAM, S3, CloudFront), Google Cloud Platform
Containers & Orchestration: Kubernetes, Docker, Helm, ArgoCD
Infrastructure as Code: Terraform, Ansible
CI/CD & Monitoring: GitHub Actions, Jenkins, Prometheus, Grafana, Datadog
Scripting & OS: Linux/Unix, Bash, Python, Go, Git

WORK EXPERIENCE
Lead Infrastructure Engineer | Stratus Scale (2022 - Present)
- Managed 14 multi-tenant Kubernetes clusters running 200+ microservices with 99.99% uptime SLA.
- Standardized multi-region cloud provisioning using modular Terraform configurations.

DevOps Engineer | CloudBridge Systems (2018 - 2022)
- Built automated CI/CD deployment pipelines using GitHub Actions and Helm.
- Configured real-time system telemetry and alerting via Prometheus and Grafana.

EDUCATION
B.S. in Information Systems | University of Texas at Austin (2018)`
  }
];

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onProfileExtracted,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [parsingStep, setParsingStep] = useState<
    'idle' | 'reading' | 'gemini_extract' | 'normalizing' | 'complete' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'docx', 'txt', 'md'];

    if (!ext || !allowed.includes(ext)) {
      setErrorMessage(`Unsupported format (.${ext}). Please upload a PDF, DOCX, or TXT document.`);
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15MB limit.');
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);
  };

  const handleProcessSubmission = async (overrideText?: string) => {
    const textToSend = overrideText !== undefined ? overrideText : (activeTab === 'paste' ? pastedText : '');

    if (activeTab === 'upload' && !file && !textToSend) {
      setErrorMessage('Please select a resume file or switch to Paste Text mode.');
      return;
    }
    if (activeTab === 'paste' && !textToSend.trim()) {
      setErrorMessage('Please paste your resume text before running extraction.');
      return;
    }

    setParsingStep('reading');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      if (file && activeTab === 'upload' && !overrideText) {
        formData.append('resume', file);
      }
      if (textToSend) {
        formData.append('text', textToSend);
      }

      setParsingStep('gemini_extract');

      const response = await fetch('/api/resume/upload-and-extract', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      });

      // Validate Content-Type before reading response body
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const rawHtml = await response.text();
        console.error('[Resume Extraction Non-JSON Error]: Status', response.status, rawHtml.slice(0, 400));
        setErrorMessage(`Server error (${response.status}): Expected JSON from extraction API but received ${contentType || 'non-JSON HTML'}. Diagnostic: ${rawHtml.slice(0, 160)}...`);
        setParsingStep('error');
        return;
      }

      let data: any = null;
      try {
        data = await response.json();
      } catch (jsonErr: any) {
        console.error('[JSON Parse Error]:', jsonErr);
        setErrorMessage(`Failed to parse extraction server response: ${jsonErr.message}`);
        setParsingStep('error');
        return;
      }

      if (!response.ok || !data || data.success === false || !data.profile) {
        const errorMsg = data?.error || data?.message || `Extraction failed with HTTP status ${response.status}`;
        console.error('[Extraction Error from API]:', errorMsg);
        setErrorMessage(errorMsg);
        setParsingStep('error');
        return;
      }

      // Preserve actual uploaded resume data
      const rawProfile = data.profile;
      const basics = rawProfile.basics || {};

      const cleanProfile: UserProfile = {
        id: rawProfile.id || `profile-${Date.now()}`,
        fullName: rawProfile.fullName || basics.fullName || null,
        email: rawProfile.email || basics.email || null,
        phone: rawProfile.phone || basics.phone || null,
        currentRole: rawProfile.currentRole || basics.currentRole || null,
        yearsOfExperience: rawProfile.yearsOfExperience !== undefined ? rawProfile.yearsOfExperience : (basics.yearsOfExperience !== undefined ? basics.yearsOfExperience : null),
        location: rawProfile.location || basics.location || null,
        summary: rawProfile.summary || basics.summary || null,
        previousRoles: Array.isArray(rawProfile.previousRoles) ? rawProfile.previousRoles : [],
        industries: Array.isArray(rawProfile.industries) ? rawProfile.industries : [],
        education: Array.isArray(rawProfile.education) ? rawProfile.education : [],
        skills: Array.isArray(rawProfile.skills) ? rawProfile.skills : [],
        technicalSkills: Array.isArray(rawProfile.technicalSkills) && rawProfile.technicalSkills.length > 0 ? rawProfile.technicalSkills : (Array.isArray(rawProfile.skills) ? rawProfile.skills : []),
        softSkills: Array.isArray(rawProfile.softSkills) ? rawProfile.softSkills : [],
        workExperience: Array.isArray(rawProfile.workExperience) ? rawProfile.workExperience : [],
        projects: Array.isArray(rawProfile.projects) ? rawProfile.projects : [],
        certifications: Array.isArray(rawProfile.certifications) ? rawProfile.certifications : [],
        tools: Array.isArray(rawProfile.tools) ? rawProfile.tools : [],
        domains: Array.isArray(rawProfile.domains) ? rawProfile.domains : [],
        languages: Array.isArray(rawProfile.languages) ? rawProfile.languages : [],
        careerInterests: Array.isArray(rawProfile.careerInterests) ? rawProfile.careerInterests : [],
        achievements: Array.isArray(rawProfile.achievements) ? rawProfile.achievements : [],
        createdAt: rawProfile.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        extractionSource: rawProfile.extractionSource || (data.source === 'fallback' ? 'fallback' : 'gemini'),
        extractionConfidence: rawProfile.extractionConfidence || (rawProfile.extractionSource === 'gemini' ? 0.98 : 0.85)
      };

      setParsingStep('normalizing');
      await new Promise(r => setTimeout(r, 300));

      setParsingStep('complete');
      if (cleanProfile.extractionSource === 'fallback') {
        setIsFallbackMode(true);
      } else {
        setIsFallbackMode(false);
      }
      if (data.meta) {
        StorageService.saveResumeMeta(data.meta);
      }
      onProfileExtracted(cleanProfile, data.meta);
      onNavigate('/profile');
    } catch (err: any) {
      console.error('[Network/Fetch Error]:', err.message);
      setErrorMessage(`Network error: ${err.message || 'Failed to reach resume extraction service'}. Please verify server connection.`);
      setParsingStep('error');
    }
  };

  const handleFallbackExtraction = async (directText?: string) => {
    try {
      setParsingStep('normalizing');
      setErrorMessage(null);
      const formData = new FormData();
      if (file && !directText) {
        formData.append('resume', file);
      }
      if (directText || pastedText) {
        formData.append('text', directText || pastedText);
      }

      const fallbackRes = await fetch('/api/resume/fallback', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      });

      const contentType = fallbackRes.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const rawHtml = await fallbackRes.text();
        console.error('[Fallback Route Non-JSON Error]:', fallbackRes.status, rawHtml.slice(0, 300));
        setErrorMessage(`Fallback extraction returned non-JSON (${fallbackRes.status}): ${rawHtml.slice(0, 150)}...`);
        setParsingStep('error');
        return;
      }

      const fallbackData = await fallbackRes.json();
      if (fallbackRes.ok && fallbackData && fallbackData.success && fallbackData.profile) {
        setIsFallbackMode(true);
        setParsingStep('complete');
        onProfileExtracted(fallbackData.profile, fallbackData.meta);
        onNavigate('/profile');
        return;
      }

      setErrorMessage(fallbackData?.error || 'Deterministic extraction was unable to parse profile details.');
      setParsingStep('error');
    } catch (e: any) {
      console.error('[Fallback route error]:', e);
      setErrorMessage(`Deterministic parsing failed: ${e.message}`);
      setParsingStep('error');
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setPastedText(sampleText);
    setActiveTab('paste');
  };

  const handleCreateBlankProfile = () => {
    const blankProfile: UserProfile = {
      id: `profile-${Date.now()}`,
      fullName: '',
      email: '',
      phone: '',
      currentRole: '',
      yearsOfExperience: null,
      location: '',
      education: [],
      skills: [],
      technicalSkills: [],
      softSkills: [],
      projects: [],
      certifications: [],
      workExperience: [],
      careerInterests: [],
      domains: [],
      tools: [],
      languages: [],
      achievements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      extractionSource: 'manual',
      extractionConfidence: 1.0
    };
    onProfileExtracted(blankProfile);
    onNavigate('/profile');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
          <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
          <span>PathForge AI • End-to-End Intelligence Pipeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Intake Your Career Resume
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Upload any PDF/DOCX resume, paste raw text, or select a verified benchmark candidate profile.
        </p>
      </div>

      {/* Visual Architecture Stepper Pipeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-inner">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 px-1">
          <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-cyan-400" />
            Active Architecture Flow
          </span>
          <span>Dual-Track Intelligence</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          <div className={`p-2.5 rounded-xl border text-center transition-all ${
            parsingStep === 'reading'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/50'
              : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}>
            <FileText className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
            <p className="font-bold text-[11px] leading-tight">1. Resume</p>
            <p className="text-[9px] text-slate-400">PDF / DOCX / Text</p>
          </div>

          <div className={`p-2.5 rounded-xl border text-center transition-all ${
            parsingStep === 'gemini_extract'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/50'
              : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}>
            <Sparkles className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
            <p className="font-bold text-[11px] leading-tight">2. Gemini AI</p>
            <p className="text-[9px] text-slate-400">Profile Extraction</p>
          </div>

          <div className={`p-2.5 rounded-xl border text-center transition-all ${
            parsingStep === 'normalizing'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/50'
              : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}>
            <Layers className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
            <p className="font-bold text-[11px] leading-tight">3. Normalization</p>
            <p className="text-[9px] text-slate-400">60+ Taxonomy</p>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-300 text-center">
            <Database className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <p className="font-bold text-[11px] leading-tight">4. Market & Roles</p>
            <p className="text-[9px] text-slate-400">Adzuna + 20 Targets</p>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-300 text-center">
            <Cpu className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
            <p className="font-bold text-[11px] leading-tight">5. Dual Engine</p>
            <p className="text-[9px] text-slate-400">Formula + RF ML</p>
          </div>

          <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-slate-300 text-center">
            <GitBranch className="w-4 h-4 mx-auto mb-1 text-purple-400" />
            <p className="font-bold text-[11px] leading-tight">6. Paths & Plan</p>
            <p className="text-[9px] text-slate-400">Gaps + Roadmap</p>
          </div>
        </div>
      </div>

      {/* Intake Method Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-xs transition border-b-2 ${
            activeTab === 'upload'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Document (PDF / DOCX)
        </button>

        <button
          onClick={() => { setActiveTab('paste'); setErrorMessage(null); }}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-xs transition border-b-2 ${
            activeTab === 'paste'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardPaste className="w-4 h-4" />
          Paste Resume Text
        </button>

        <button
          onClick={() => { setActiveTab('samples'); setErrorMessage(null); }}
          className={`flex items-center gap-2 pb-3 px-4 font-semibold text-xs transition border-b-2 ${
            activeTab === 'samples'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Quick Test Benchmarks (1-Click)
        </button>
      </div>

      {/* Tab 1: File Upload */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Holographic 3D Ingestion Core */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between px-3 text-[11px] font-mono text-slate-400 mb-1">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">
                Quantum Ingestion Portal
              </span>
              <span>{isDragging ? 'Vortex Attractor Active' : (parsingStep === 'gemini_extract' ? 'Gemini Laser Scanning...' : 'Awaiting Document Input')}</span>
            </div>
            <ResumeIngestionPortal3D status={parsingStep} isDragging={isDragging} />
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
                : 'border-slate-750 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={handleFileInput}
            />

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-inner">
                <FileText className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Drag & Drop your resume here, or <span className="text-cyan-400 underline decoration-cyan-500/50">browse files</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Accepts PDF, DOCX, TXT documents up to 15MB
                </p>
              </div>
            </div>
          </div>

          {/* Selected File Details & Action */}
          {file && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-800/50 text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">{file.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    {(file.size / 1024).toFixed(1)} KB • {file.name.split('.').pop()?.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setFile(null); setErrorMessage(null); }}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleProcessSubmission()}
                  disabled={parsingStep !== 'idle' && parsingStep !== 'error'}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition disabled:opacity-60"
                >
                  {parsingStep === 'reading' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Parsing Document...
                    </>
                  )}
                  {parsingStep === 'gemini_extract' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gemini Profile Extraction...
                    </>
                  )}
                  {parsingStep === 'normalizing' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Normalizing Taxonomy...
                    </>
                  )}
                  {(parsingStep === 'idle' || parsingStep === 'error' || parsingStep === 'complete') && (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Extract & Verify Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Paste Resume Text */}
      {activeTab === 'paste' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Paste Resume Text, Bio, or LinkedIn Profile
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {pastedText.length} characters
              </span>
            </div>

            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your resume contents here (experience, skills, job titles, education)..."
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-y leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPastedText('')}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Clear Text
              </button>

              <button
                type="button"
                onClick={() => handleProcessSubmission()}
                disabled={(parsingStep !== 'idle' && parsingStep !== 'error') || !pastedText.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition disabled:opacity-50"
              >
                {parsingStep === 'gemini_extract' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting via Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run AI Extraction
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Quick Benchmarks */}
      {activeTab === 'samples' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Click any verified benchmark profile to instantly load its resume and test the complete pipeline:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_RESUMES.map((sample) => (
              <div
                key={sample.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/50 transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                      {sample.exp}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{sample.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {sample.skills}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => handleSelectSample(sample.text)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 transition text-center"
                  >
                    View Text
                  </button>
                  <button
                    onClick={() => handleProcessSubmission(sample.text)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition text-center flex items-center justify-center gap-1"
                  >
                    Analyze Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Status Bar */}
      {(parsingStep === 'reading' || parsingStep === 'gemini_extract' || parsingStep === 'normalizing') && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              {parsingStep === 'reading' && 'Extracting text stream from resume document...'}
              {parsingStep === 'gemini_extract' && 'Calling Gemini 3.8 Flash for structured profile & skill extraction...'}
              {parsingStep === 'normalizing' && 'Normalizing extracted skills against canonical 60+ taxonomy...'}
            </span>
            <span className="text-cyan-400 font-mono text-[11px]">
              Processing
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500 animate-pulse"
              style={{
                width: parsingStep === 'reading' ? '30%' : (parsingStep === 'gemini_extract' ? '70%' : '95%')
              }}
            />
          </div>
        </div>
      )}

      {/* Error Message & Fallback Option */}
      {parsingStep === 'error' && errorMessage && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">Intake Notice</h4>
              <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">{errorMessage}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-rose-900/40">
            <button
              onClick={() => handleProcessSubmission()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-900/60 hover:bg-rose-800/80 text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Extraction
            </button>

            <button
              onClick={() => handleFallbackExtraction()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-yellow-300 border border-yellow-700/50 transition"
              title="Runs local deterministic skill dictionary parser"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" />
              Use Deterministic Parser
            </button>

            <button
              onClick={handleCreateBlankProfile}
              className="text-xs text-slate-400 hover:text-slate-200 underline ml-auto"
            >
              Or enter profile manually →
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry Fallback Link */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Want to build your profile step by step?{' '}
          <button
            onClick={handleCreateBlankProfile}
            className="text-cyan-400 hover:underline font-semibold"
          >
            Create or customize profile manually
          </button>
        </p>
      </div>
    </div>
  );
};
