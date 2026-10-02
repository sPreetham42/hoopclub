import { execSync } from 'child_process';
import { randomInt } from 'crypto';

// 1. Configuration & Random Decision
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

const randVal = randomInt(100);
if (randVal >= RUN_PROBABILITY) {
  console.log(`[automation] Random decision: SKIP (${randVal} >= ${RUN_PROBABILITY}). Nothing to do.`);
  process.exit(0);
}
console.log(`[automation] Random decision: RUN (${randVal} < ${RUN_PROBABILITY})`);

// 2. Select a task
const tasks = ['frontend-update', 'backend-update', 'frontend-lint'];
const selectedTask = tasks[randomInt(tasks.length)];
console.log(`[automation] Selected task: ${selectedTask}`);

// 3. Execute Task
function runCommand(command, cwd = '.') {
  execSync(command, { cwd, stdio: 'inherit' });
}

try {
  if (selectedTask === 'frontend-update') runCommand('npm update', './frontend');
  else if (selectedTask === 'backend-update') runCommand('npm update', './backend');
  else if (selectedTask === 'frontend-lint') runCommand('npm run lint -- --fix', './frontend');

  // 4. Check Diff
  let hasChanges = true;
  try {
    execSync('git diff --quiet');
    execSync('git diff --cached --quiet');
    hasChanges = false;
  } catch (error) {
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log('[automation] No changes produced by task. Exiting.');
    process.exit(0);
  }

  // 5. Validate
  console.log('[automation] Changes detected. Validating...');
  if (selectedTask.startsWith('frontend-')) {
    runCommand('npm run lint', './frontend');
    runCommand('npm run build', './frontend');
  } else {
    console.log('[automation] Warning: Backend lacks automated tests. Assuming safe.');
  }

  // 6. Commit & Push
  let commitMsg = 'chore: update dependencies';
  if (selectedTask === 'frontend-lint') commitMsg = 'chore: apply formatting fixes';

  if (process.env.DRY_RUN === 'true') {
    console.log(`[automation] DRY_RUN: Would commit with "${commitMsg}"`);
    console.log('[automation] Reverting dry-run changes...');
    runCommand('git restore .');
    process.exit(0);
  }

  try {
    execSync('git config user.name', { stdio: 'ignore' });
  } catch (error) {
    runCommand('git config user.name "github-actions[bot]"');
    runCommand('git config user.email "github-actions[bot]@users.noreply.github.com"');
  }

  runCommand('git add .');
  runCommand(`git commit -m "${commitMsg}"`);
  runCommand('git push origin HEAD');
  console.log('[automation] Push SUCCESS');

} catch (error) {
  console.error('[automation] Task or validation FAILED. Reverting changes.');
  runCommand('git restore .');
  process.exit(1);
}
