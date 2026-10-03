import fs from 'fs/promises';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'tournament_state.json');

const defaultState = {
  tournament_status: "in_progress",
  current_phase: "Phase 1: Chaos Qualifiers",
  current_match: 1,
  qualified_winners: {}
};

export async function loadState() {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    await saveState(defaultState);
    return { ...defaultState };
  }
}

export async function saveState(state) {
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function resetTournament() {
  const freshState = {
    tournament_status: "in_progress",
    current_phase: "Phase 1: Chaos Qualifiers",
    current_match: 1,
    qualified_winners: {}
  };
  await saveState(freshState);
  return freshState;
}
