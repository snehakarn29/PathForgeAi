import { UserProfile } from '../types/profile.ts';
import { MarketSnapshot } from '../types/market.ts';

export const DEMO_USER_PROFILE: UserProfile = {
  id: 'demo-arjun-sharma-2026',
  fullName: 'Arjun Sharma',
  email: 'arjun.sharma.demo@example.com',
  phone: '+91 98765 43210',
  currentRole: 'Java Backend Developer',
  yearsOfExperience: 3,
  location: 'Indore, Madhya Pradesh, India',
  education: [
    {
      degree: 'Bachelor of Technology',
      fieldOfStudy: 'Computer Science and Engineering',
      institution: 'SGSITS Indore',
      year: '2023',
      grade: '8.4 CGPA'
    }
  ],
  skills: [
    'Java',
    'Spring Boot',
    'SQL',
    'REST APIs',
    'Microservices',
    'Docker',
    'PostgreSQL',
    'Git',
    'Linux',
    'CI/CD Pipelines'
  ],
  technicalSkills: [
    'Java',
    'Spring Boot',
    'SQL',
    'REST APIs',
    'Microservices',
    'Docker',
    'PostgreSQL',
    'Linux'
  ],
  softSkills: [
    'Complex Problem Solving',
    'Technical Communication & Collaboration'
  ],
  tools: [
    'Git',
    'IntelliJ IDEA',
    'Postman',
    'Docker Desktop'
  ],
  domains: [
    'Fintech',
    'Enterprise SaaS'
  ],
  languages: [
    'English',
    'Hindi'
  ],
  workExperience: [
    {
      company: 'TechInnovate Solutions',
      role: 'Java Backend Developer',
      duration: 'Jul 2023 - Present (1.5 yrs)',
      location: 'Indore, India',
      responsibilities: [
        'Designed high-throughput REST APIs using Spring Boot and PostgreSQL for transaction processing.',
        'Migrated monolithic payment gateway service to microservices running on Docker containers.',
        'Optimized complex SQL queries reducing P99 latency by 34% across 2M daily records.'
      ]
    },
    {
      company: 'Nexus Software Labs',
      role: 'Junior Software Engineer Intern',
      duration: 'Jan 2023 - Jun 2023 (6 mos)',
      location: 'Indore, India',
      responsibilities: [
        'Built internal unit test suites and integrated CI/CD pipelines with GitHub Actions.',
        'Assisted in data migration from MySQL to PostgreSQL database instances.'
      ]
    }
  ],
  projects: [
    {
      name: 'Distributed Ledger Microservice',
      technologies: ['Java 17', 'Spring Boot', 'PostgreSQL', 'Docker'],
      description: 'An idempotent transactional event consumer with database idempotency keys and structured audit logs.'
    },
    {
      name: 'API Rate Limiting Middleware',
      technologies: ['Java', 'Redis', 'Spring Cloud Gateway'],
      description: 'Token bucket rate limiter mitigating DDoS bursts and enforcing tenant tier quotas.'
    }
  ],
  certifications: [
    {
      name: 'Oracle Certified Professional: Java SE 17 Developer',
      issuer: 'Oracle',
      year: '2024'
    }
  ],
  careerInterests: [
    'GenAI Application Developer',
    'AI Engineer',
    'Cloud-Native Microservices'
  ],
  achievements: [
    'Solved 400+ problems on LeetCode with strong focus on graphs, dynamic programming, and concurrency.',
    'Awarded Spot Excellence at TechInnovate for zero-downtime microservice cutover.'
  ],
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-02T12:00:00.000Z',
  extractionSource: 'demo',
  extractionConfidence: 1.0
};

export const DEMO_MARKET_SNAPSHOT: MarketSnapshot = {
  id: 'snapshot-demo-indore-java-2026',
  role: 'Java Backend Developer',
  location: 'Indore, Madhya Pradesh, India',
  country: 'in',
  query: 'Java Backend Developer',
  totalJobs: 146,
  sampleSize: 146,
  skillCounts: {
    'Java': 138,
    'Spring Boot': 122,
    'SQL': 114,
    'REST APIs': 105,
    'Microservices': 94,
    'Docker': 82,
    'PostgreSQL': 76,
    'Git': 98,
    'Linux': 70,
    'CI/CD Pipelines': 64,
    'Kubernetes': 52,
    'AWS': 66,
    'Python': 44,
    'LLM APIs & Prompt Engineering': 28
  },
  skillFrequencies: [
    { skill: 'Java', count: 138, frequency: 0.945, category: 'Programming' },
    { skill: 'Spring Boot', count: 122, frequency: 0.835, category: 'Backend' },
    { skill: 'SQL', count: 114, frequency: 0.780, category: 'Database' },
    { skill: 'REST APIs', count: 105, frequency: 0.719, category: 'Backend' },
    { skill: 'Git', count: 98, frequency: 0.671, category: 'Tools' },
    { skill: 'Microservices', count: 94, frequency: 0.643, category: 'Architecture' },
    { skill: 'Docker', count: 82, frequency: 0.561, category: 'DevOps' },
    { skill: 'PostgreSQL', count: 76, frequency: 0.520, category: 'Database' },
    { skill: 'Linux', count: 70, frequency: 0.479, category: 'DevOps' },
    { skill: 'AWS', count: 66, frequency: 0.452, category: 'Cloud' },
    { skill: 'CI/CD Pipelines', count: 64, frequency: 0.438, category: 'DevOps' },
    { skill: 'Kubernetes', count: 52, frequency: 0.356, category: 'DevOps' },
    { skill: 'Python', count: 44, frequency: 0.301, category: 'Programming' },
    { skill: 'LLM APIs & Prompt Engineering', count: 28, frequency: 0.191, category: 'GenAI' }
  ],
  demandIndex: 78,
  averageSalary: 1450000,
  source: 'Adzuna API (Demo / Prototype Reference Benchmark)',
  sourceUrl: 'https://api.adzuna.com/v1/api/jobs/in/search/1',
  fetchedAt: '2026-10-02T08:30:00.000Z',
  expiresAt: '2026-10-09T08:30:00.000Z',
  dataQuality: 'High',
  provider: 'demo',
  cacheStatus: 'demo',
  warningMessage: 'DEMO / PROTOTYPE DATA: Pre-indexed historical snapshot for demo presentation walkthrough.'
};
