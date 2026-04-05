export type ChallengeType = 'DSA' | 'PR Review' | 'War Room' | 'System Design' | 'Tech Debt Tribunal';
export type RoleLevel = 'SDE I' | 'SDE II' | 'SDE III' | 'Staff';

export interface ChallengeOption {
  label: string;
  title: string;
  sub: string;
  isCorrect: boolean;
}

export interface TestCase {
  id: string;
  description: string;
  input: string;
  expected: string;
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  badgeClass: string;
  title: string;
  companies: string[];
  timeEst: string;
  level: RoleLevel;
  status: 'In Progress' | 'Not Started' | 'Completed';
  desc: string;
  solution: string;
  options?: ChallengeOption[];
  // DSA-specific enrichment
  hints?: string[];
  starterCode?: string;
  topics?: string[];
  testCases?: TestCase[];
  nextChallengeId?: string;
}

