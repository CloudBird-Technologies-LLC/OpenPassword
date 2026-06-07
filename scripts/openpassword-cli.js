#!/usr/bin/env node

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const commands = {
  help: {
    description: 'Muestra los comandos disponibles.',
    run: printHelp
  },
  status: {
    description: 'Comprueba la conexion y muestra el total de registros.',
    run: showStatus
  },
  reset: {
    description: 'Borra todos los datos y deja la instancia lista para onboarding.',
    run: resetInstance
  }
};

function printHelp() {
  console.log('OpenPassword CLI');
  console.log('');
  console.log('Uso: openpassword -<comando> [opciones]');
  console.log('');
  for (const [name, command] of Object.entries(commands)) {
    console.log(`  -${name.padEnd(9)} ${command.description}`);
  }
  console.log('');
  console.log('Opciones de reset:');
  console.log('  -yes       Omite la confirmacion interactiva.');
}

async function showStatus() {
  const [
    users,
    vaults,
    items,
    tags,
    teamMembers,
    invitations,
    sharedLinks,
    devices,
    apiKeys
  ] = await Promise.all([
    prisma.user.count(),
    prisma.vault.count(),
    prisma.passwordItem.count(),
    prisma.tag.count(),
    prisma.teamMember.count(),
    prisma.invitation.count(),
    prisma.sharedLink.count(),
    prisma.device.count(),
    prisma.apiKey.count()
  ]);

  console.table({
    users,
    vaults,
    items,
    tags,
    teamMembers,
    invitations,
    sharedLinks,
    devices,
    apiKeys
  });
}

async function confirmReset(skipConfirmation) {
  if (skipConfirmation) return true;

  if (!stdin.isTTY) {
    throw new Error('Reset cancelado: usa -yes en entornos no interactivos.');
  }

  const prompt = readline.createInterface({ input: stdin, output: stdout });
  const answer = await prompt.question(
    'Esto borrara TODOS los datos de OpenPassword. Escribe RESET para continuar: '
  );
  prompt.close();
  return answer === 'RESET';
}

async function resetInstance(args) {
  const confirmed = await confirmReset(args.includes('-yes') || args.includes('--yes'));
  if (!confirmed) {
    console.log('Reset cancelado.');
    return;
  }

  await prisma.$transaction([
    prisma.vaultMember.deleteMany(),
    prisma.sharedLink.deleteMany(),
    prisma.passwordItem.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.vault.deleteMany(),
    prisma.device.deleteMany(),
    prisma.apiKey.deleteMany(),
    prisma.user.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.invitation.deleteMany()
  ]);

  console.log('Instancia reiniciada. Abre /setup para comenzar el onboarding.');
}

async function main() {
  const [rawCommand = '-help', ...args] = process.argv.slice(2);
  const commandName = rawCommand.replace(/^-+/, '');
  const command = commands[commandName];

  if (!command) {
    console.error(`Comando desconocido: ${rawCommand}`);
    printHelp();
    process.exitCode = 1;
    return;
  }

  await command.run(args);
}

main()
  .catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
