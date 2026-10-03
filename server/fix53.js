import fs from 'fs';
let content = fs.readFileSync('state.js', 'utf8');

content = content.replace(
    /export async function resetTournament\(\) \{\s*await saveState\(defaultState\);\s*return \{ \.\.\.defaultState \};\s*\}/,
    `export async function resetTournament() {
  const freshState = {
    tournament_status: "in_progress",
    current_phase: "Phase 1: Chaos Qualifiers",
    current_match: 1,
    qualified_winners: {}
  };
  await saveState(freshState);
  return freshState;
}`
);

fs.writeFileSync('state.js', content);
console.log("Fixed state.js shallow copy bug");
