import { execSync } from 'child_process';
import { randomInt } from 'crypto';
import fs from 'fs';

// Configuration
const rawProb = process.env.RUN_PROBABILITY;
let RUN_PROBABILITY = 40;

if (rawProb !== undefined && rawProb !== '') {
  if (!/^-?\d+$/.test(rawProb)) {
    console.error(`[automation] Error: RUN_PROBABILITY must be an integer between 0 and 100. Received: ${rawProb}`);
    process.exit(1);
  }
  
  RUN_PROBABILITY = parseInt(rawProb, 10);
  
  if (RUN_PROBABILITY < 0 || RUN_PROBABILITY > 100) {
    console.error(`[automation] Error: RUN_PROBABILITY must be between 0 and 100. Received: ${RUN_PROBABILITY}`);
    process.exit(1);
  }
}

const DRY_RUN = process.env.DRY_RUN === 'true';

console.log('[automation] Scheduled run started');

// Random decision
const randVal = randomInt(100);
if (randVal >= RUN_PROBABILITY) {
  console.log(`[automation] Random decision: SKIP (${randVal} >= ${RUN_PROBABILITY})`);
  console.log('[automation] Nothing to do');
  process.exit(0);
}

console.log(`[automation] Random decision: RUN (${randVal} < ${RUN_PROBABILITY})`);

// Tasks available
const TASKS = ['backend-dedupe', 'frontend-dedupe', 'frontend-lint'];

// Select a random task
const taskIndex = randomInt(TASKS.length);
const selectedTask = TASKS[taskIndex];

console.log(`[automation] Selected task: ${selectedTask}`);

function runCommand(command, cwd) {
  try {
    execSync(command, { cwd, stdio: 'inherit' });
  } catch (error) {
    console.error(`[automation] Command failed: ${command} in ${cwd}`);
    process.exit(1);
  }
}

// Execute task
if (selectedTask === 'backend-dedupe') {
  runCommand('npm dedupe', './backend');
} else if (selectedTask === 'frontend-dedupe') {
  runCommand('npm dedupe', './frontend');
} else if (selectedTask === 'frontend-lint') {
  runCommand('npm run lint -- --fix', './frontend');
}

console.log('[automation] Running validation');
// Validation
if (selectedTask.startsWith('frontend-')) {
  try {
    execSync('npm run lint', { cwd: './frontend', stdio: 'inherit' });
  } catch (error) {
    console.log('[automation] Validation: FAIL');
    process.exit(1);
  }
}
console.log('[automation] Validation: PASS');

// Check diff
let hasChanges = true;
try {
  execSync('git diff --quiet');
  hasChanges = false;
} catch (error) {
  hasChanges = true;
}

if (!hasChanges) {
  console.log('[automation] Changes detected: NO');
  console.log('[automation] Nothing to do');
  process.exit(0);
} else {
  console.log('[automation] Changes detected: YES');
}

// Configure Git if not configured
try {
  execSync('git config user.name', { stdio: 'ignore' });
} catch (error) {
  runCommand('git config user.name "github-actions[bot]"', '.');
  runCommand('git config user.email "github-actions[bot]@users.noreply.github.com"', '.');
}

// Create commit
let commitMsg = 'chore: lockfile maintenance';
if (selectedTask === 'frontend-lint') {
  commitMsg = 'chore: apply formatting fixes';
}

console.log('[automation] Creating commit');
runCommand('git add .', '.');
runCommand(`git commit -m "${commitMsg}"`, '.');

if (DRY_RUN) {
  console.log('[automation] DRY_RUN is set. Skipping push.');
  console.log('[automation] Push: SUCCESS (dry run)');
  process.exit(0);
}

console.log('[automation] Pushing commit');
try {
  execSync('git push origin HEAD', { stdio: 'inherit' });
  console.log('[automation] Push: SUCCESS');
} catch (error) {
  console.log('[automation] Push: FAIL');
  process.exit(1);
}
