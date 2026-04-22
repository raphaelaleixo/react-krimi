// Round 1 gets this many clues; subsequent rounds add one more each.
export const ROUND_1_COUNT = 6;

export function randomRotation() {
  return Math.floor(3 - Math.random() * 6);
}
