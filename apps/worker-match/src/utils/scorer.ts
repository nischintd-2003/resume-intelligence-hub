const FUZZY_THRESHOLD = 0.75;
export const normalizeSkill = (skill: string): string =>
  skill.toLowerCase().trim().replace(/\s+/g, ' ');

export const diceCoefficient = (a: string, b: string): number => {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigrams = (s: string): Map<string, number> => {
    const map = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bigram = s.slice(i, i + 2);
      map.set(bigram, (map.get(bigram) ?? 0) + 1);
    }
    return map;
  };

  const aBigrams = bigrams(a);
  const bBigrams = bigrams(b);

  let intersectionCount = 0;
  for (const [bigram, countA] of aBigrams) {
    const countB = bBigrams.get(bigram) ?? 0;
    intersectionCount += Math.min(countA, countB);
  }

  return (2 * intersectionCount) / (a.length - 1 + (b.length - 1));
};

const isSkillSatisfied = (
  requiredSkill: string,
  candidateSet: Set<string>,
  candidateSkillsNormalized: string[],
): boolean => {
  const normalizedReq = normalizeSkill(requiredSkill);

  if (candidateSet.has(normalizedReq)) return true;

  return candidateSkillsNormalized.some(
    (candidate) => diceCoefficient(candidate, normalizedReq) >= FUZZY_THRESHOLD,
  );
};

export interface ScoreResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export const calculateScore = (
  candidateSkills: string[],
  requiredSkills: string[],
): ScoreResult => {
  if (requiredSkills.length === 0) {
    return { score: 100, matchedSkills: [], missingSkills: [] };
  }

  const candidateSkillsNormalized = candidateSkills.map(normalizeSkill);
  const candidateSet = new Set(candidateSkillsNormalized);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of requiredSkills) {
    if (isSkillSatisfied(req, candidateSet, candidateSkillsNormalized)) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  return { score, matchedSkills, missingSkills };
};
