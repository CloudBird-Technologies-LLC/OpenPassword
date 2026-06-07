/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require('node:child_process');

const knownRecoverableMigration = '00000000000000_init';

function run(command, args, captureOutput = false) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: captureOutput ? 'pipe' : 'inherit',
    shell: process.platform === 'win32'
  });

  if (captureOutput) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  return result;
}

function migrate() {
  const deployment = run('npx', ['prisma', 'migrate', 'deploy'], true);
  if (deployment.status === 0) return;

  const output = `${deployment.stdout || ''}\n${deployment.stderr || ''}`;
  const canRecover =
    output.includes('P3009') &&
    output.includes(knownRecoverableMigration);

  if (!canRecover) {
    process.exit(deployment.status || 1);
  }

  console.log(`Recovering known failed migration: ${knownRecoverableMigration}`);
  const resolution = run('npx', [
    'prisma',
    'migrate',
    'resolve',
    '--rolled-back',
    knownRecoverableMigration
  ]);

  if (resolution.status !== 0) {
    process.exit(resolution.status || 1);
  }

  const retry = run('npx', ['prisma', 'migrate', 'deploy']);
  if (retry.status !== 0) {
    process.exit(retry.status || 1);
  }
}

migrate();

const server = run('npx', ['next', 'start']);
process.exit(server.status || 0);
