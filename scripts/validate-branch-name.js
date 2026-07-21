import { execSync } from 'child_process';

const validBranchNamePattern = /^(feat|fix|chore|docs|refactor|test)\/[a-z0-9-]+$/;

try {
  const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

  if (branchName === 'main' || branchName === 'development' || branchName === 'HEAD') {
    process.exit(0);
  }

  if (!validBranchNamePattern.test(branchName)) {
    console.error(`\x1b[31mError: Invalid branch name "${branchName}"\x1b[0m`);
    console.error('Branch names must follow the pattern: <type>/<description>');
    console.error('Valid types: feat, fix, chore, docs, refactor, test');
    console.error('Example: feat/add-login-form');
    process.exit(1);
  }
} catch (error) {
  console.error('Failed to validate branch name:', error.message);
  // Do not exit with 1 on detached HEAD or if not a git repo to prevent blocking setup
  process.exit(0);
}
