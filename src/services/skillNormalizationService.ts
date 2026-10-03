import { NormalizedSkill } from '../types/skills.ts';
import { SKILL_TAXONOMY, SKILL_MAP } from '../data/taxonomy.ts';

/**
 * Normalizes an arbitrary skill string to a canonical NormalizedSkill from the taxonomy.
 */
export function normalizeSkill(input: string): NormalizedSkill | null {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim().toLowerCase();

  // 1. Direct ID match
  if (SKILL_MAP.has(clean)) {
    return SKILL_MAP.get(clean)!;
  }

  // 2. Direct Name match
  const byName = SKILL_TAXONOMY.find(s => s.name.toLowerCase() === clean);
  if (byName) return byName;

  // 3. Alias match
  const byAlias = SKILL_TAXONOMY.find(s =>
    s.aliases.some(a => a.toLowerCase() === clean || clean.includes(a.toLowerCase()))
  );
  if (byAlias) return byAlias;

  // 4. Substring / Token matching
  const byToken = SKILL_TAXONOMY.find(s => {
    const sName = s.name.toLowerCase();
    return clean.includes(sName) || sName.includes(clean);
  });
  if (byToken) return byToken;

  return null;
}

/**
 * Normalizes an array of raw skill strings, deduplicating canonical skills.
 */
export function normalizeSkillList(rawSkills: string[]): {
  normalized: NormalizedSkill[];
  unmapped: string[];
} {
  const seenIds = new Set<string>();
  const normalized: NormalizedSkill[] = [];
  const unmapped: string[] = [];

  for (const raw of rawSkills) {
    if (!raw || !raw.trim()) continue;
    const norm = normalizeSkill(raw);
    if (norm) {
      if (!seenIds.has(norm.id)) {
        seenIds.add(norm.id);
        normalized.push(norm);
      }
    } else {
      if (!unmapped.includes(raw.trim())) {
        unmapped.push(raw.trim());
      }
    }
  }

  return { normalized, unmapped };
}

/**
 * Deterministic text parser to find taxonomy skills mentioned in a block of raw resume text.
 * Used for fallback extraction or market job description scanning.
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matchedSkills: string[] = [];

  for (const skill of SKILL_TAXONOMY) {
    let matched = false;

    // Check main name with word boundaries
    const escapedName = skill.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameRegex = new RegExp(`\\b${escapedName}\\b`, 'i');
    if (nameRegex.test(lower)) {
      matched = true;
    } else {
      // Check aliases
      for (const alias of skill.aliases) {
        const escapedAlias = alias.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const aliasRegex = new RegExp(`\\b${escapedAlias}\\b`, 'i');
        if (aliasRegex.test(lower)) {
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      matchedSkills.push(skill.name);
    }
  }

  return matchedSkills;
}
