export * from './types';
import { dsaChallenges } from './dsa/index';
import { prChallenges } from './pr';
import { warChallenges } from './war';
import { sysChallenges } from './sys';
import { techChallenges } from './tech';

export const CHALLENGES = [
  ...dsaChallenges,
  ...prChallenges,
  ...warChallenges,
  ...sysChallenges,
  ...techChallenges
];
