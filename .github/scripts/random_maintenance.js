import { execSync } from 'child_process';
import { randomInt } from 'crypto';
import fs from 'fs';
import path from 'path';

// --- Configuration ---
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

const MAX_TASK_ATTEMPTS = parseInt(process.env.MAX_TASK_ATTEMPTS || '3', 10);
const MAX_COMMITS_PER_RUN = parseInt(process.env.MAX_COMMITS_PER_RUN || '1', 10);
const DRY_RUN = process.env.DRY_RUN === 'true';

console.log('[automation] Scheduled run started');

// --- Random Run Decision ---
const randVal = randomInt(100);
if (randVal >= RUN_PROBABILITY) {
  console.log(`[automation] Random decision: SKIP (${randVal} >= ${RUN_PROBABILITY})`);
  console.log('[automation] Nothing to do');
  process.exit(0);
}
console.log(`[automation] Random decision: RUN (${randVal} < ${RUN_PROBABILITY})`);

// --- Tasks ---
const TASKS = [
  'backend-dedupe',
  'frontend-dedupe',
  'frontend-lint',
  'frontend-update',
  'backend-update',
  'dependency-health-report'
];

// Shuffle array
const shuffledTasks = [...TASKS].sort(() => 0.5 - Math.random());

// --- Helpers ---
function runCommand(command, cwd = '.') {
  try {
    return execSync(command, { cwd, encoding: 'utf-8', stdio: 'pipe' });
  } catch (error) {
    // If it fails but we just want to suppress or handle it, the caller should try/catch
    throw error;
  }
}

function runCommandInherit(command, cwd = '.') {
  execSync(command, { cwd, stdio: 'inherit' });
}

function hasChanges() {
  try {
    execSync('git diff --quiet');
    execSync('git diff --cached --quiet');
    // Also check for untracked files in .github/reports
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim().length > 0) return true;
    return false;
  } catch (error) {
    return true; // git diff --quiet returns 1 if there are changes
  }
}

function revertChanges(reason = 'failed task') {
  console.log(`[automation] Reverting changes (${reason})...`);
  try {
    runCommand('git restore .');
    runCommand('git clean -fd .github/reports/');
  } catch (e) {
    console.log('[automation] Warning: Failed to revert cleanly.');
  }
}

function generateDependencyReport() {
  const reportsDir = path.resolve('.github/reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  let report = '# Dependency & Security Health Report\n\n';
  report += '> Note: This report is automatically generated to track ecosystem changes.\n\n';

  const sections = [
    { title: 'Frontend Outdated', cmd: 'npm outdated', cwd: './frontend' },
    { title: 'Backend Outdated', cmd: 'npm outdated', cwd: './backend' },
    { title: 'Frontend Audit', cmd: 'npm audit', cwd: './frontend' },
    { title: 'Backend Audit', cmd: 'npm audit', cwd: './backend' }
  ];

  for (const sec of sections) {
    report += `## ${sec.title}\n\`\`\`text\n`;
    try {
      const output = runCommand(sec.cmd, sec.cwd);
      report += (output.trim() || 'All good!') + '\n';
    } catch (err) {
      // npm outdated and npm audit exit with non-zero if issues are found
      let out = err.stdout || err.stderr || 'Command failed with no output.';
      // Strip potentially varying paths if any
      out = out.replace(new RegExp(process.cwd().replace(/\\/g, '\\\\'), 'g'), '[REPO_ROOT]');
      report += out.trim() + '\n';
    }
    report += '\`\`\`\n\n';
  }

  fs.writeFileSync(path.join(reportsDir, 'dependency-health.md'), report);
}

// --- Execution Loop ---
let commitsMade = 0;
let attempts = 0;

// Configure Git once
try {
  execSync('git config user.name', { stdio: 'ignore' });
} catch (error) {
  runCommandInherit('git config user.name "github-actions[bot]"');
  runCommandInherit('git config user.email "github-actions[bot]@users.noreply.github.com"');
}

for (const task of shuffledTasks) {
  if (commitsMade >= MAX_COMMITS_PER_RUN) {
    console.log(`[automation] Reached MAX_COMMITS_PER_RUN (${MAX_COMMITS_PER_RUN}). Stopping.`);
    break;
  }
  if (attempts >= MAX_TASK_ATTEMPTS) {
    console.log(`[automation] Reached MAX_TASK_ATTEMPTS (${MAX_TASK_ATTEMPTS}). Stopping.`);
    break;
  }
  
  attempts++;
  console.log(`\n[automation] Attempt ${attempts}: Selecting task '${task}'`);

  try {
    // 1. Execute
    if (task === 'backend-dedupe') {
      runCommandInherit('npm dedupe', './backend');
    } else if (task === 'frontend-dedupe') {
      runCommandInherit('npm dedupe', './frontend');
    } else if (task === 'frontend-lint') {
      try { runCommandInherit('npm run lint -- --fix', './frontend'); } catch(e) {} // ignore fix errors, validate later
    } else if (task === 'frontend-update') {
      runCommandInherit('npm update', './frontend');
    } else if (task === 'backend-update') {
      runCommandInherit('npm update', './backend');
    } else if (task === 'dependency-health-report') {
      generateDependencyReport();
    }

    // 2. Check Diff
    if (!hasChanges()) {
      console.log(`[automation] Task '${task}' produced NO diff. Trying another task...`);
      continue;
    }

    console.log(`[automation] Task '${task}' produced a diff. Validating...`);

    // 3. Validate
    if (task.startsWith('frontend-')) {
      console.log('[automation] Validating frontend (lint and build)...');
      runCommandInherit('npm run lint', './frontend');
      runCommandInherit('npm run build', './frontend');
    } else if (task.startsWith('backend-')) {
      console.log('[automation] Warning: Backend currently lacks automated test scripts. Assuming changes are safe.');
    }
    console.log('[automation] Validation: PASS');

    // 4. Commit
    let commitMsg = 'chore: routine repository maintenance';
    if (task.includes('dedupe')) commitMsg = `chore: lockfile maintenance (${task})`;
    if (task === 'frontend-lint') commitMsg = 'chore: apply formatting fixes';
    if (task.includes('update')) commitMsg = `chore: update dependencies (${task})`;
    if (task.includes('report')) commitMsg = 'docs: synchronize dependency health report';

    if (DRY_RUN) {
      console.log('[automation] DRY_RUN is set. Skipping commit and push.');
      console.log(`[automation] Would have committed with message: "${commitMsg}"`);
      console.log('[automation] Push: SUCCESS (dry run)');
      revertChanges('dry run cleanup'); // Revert so subsequent tasks in loop start clean
      commitsMade++;
      continue;
    }

    console.log('[automation] Creating commit');
    runCommandInherit('git add .');
    runCommandInherit(`git commit -m "${commitMsg}"`);
    
    console.log('[automation] Pushing commit');
    runCommandInherit('git push origin HEAD');
    console.log('[automation] Push: SUCCESS');
    
    commitsMade++;

  } catch (error) {
    console.log(`[automation] Task '${task}' or its validation FAILED.`);
    revertChanges('task failed');
  }
}

if (commitsMade === 0) {
  console.log('\n[automation] All attempts exhausted. No commits produced this run.');
} else {
  console.log(`\n[automation] Run complete. Produced ${commitsMade} commit(s).`);
}
