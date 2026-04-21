// Display-name rule for bounded-width player-name spots
// (see docs/superpowers/specs/2026-04-21-player-name-display-design.md).
// Unconditional: if the trimmed name has more than one whitespace-separated
// token, keep only `first[0] + '. ' + last` and drop any middles.
export function formatDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 1) return tokens[0];
  const first = tokens[0];
  const last = tokens[tokens.length - 1];
  return `${first[0].toUpperCase()}. ${last}`;
}
