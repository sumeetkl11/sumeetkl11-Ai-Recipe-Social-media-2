import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const distDir = path.join(backendRoot, 'dist');

const INCLUDE_PATHS = [
  'cache',
  'config',
  'controllers',
  'data',
  'middleware',
  'migrations',
  'models',
  'routes',
  'sockets',
  'utils',
  'fix-mealplan.js',
  'migrate.js',
  'server.js'
];

async function copyBuildFiles() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  await Promise.all(
    INCLUDE_PATHS.map((entry) =>
      cp(path.join(backendRoot, entry), path.join(distDir, entry), {
        recursive: true
      })
    )
  );
}

async function writeDistPackageJson() {
  const packageJsonPath = path.join(backendRoot, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

  const distPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    private: packageJson.private,
    type: packageJson.type,
    main: 'server.js',
    scripts: {
      start: 'node server.js',
      migrate: 'node migrate.js'
    },
    dependencies: packageJson.dependencies
  };

  await writeFile(
    path.join(distDir, 'package.json'),
    `${JSON.stringify(distPackageJson, null, 2)}\n`
  );
}

async function copyLockfile() {
  const lockfilePath = path.join(backendRoot, 'package-lock.json');
  await cp(lockfilePath, path.join(distDir, 'package-lock.json'));
}

async function build() {
  await copyBuildFiles();
  await writeDistPackageJson();
  await copyLockfile();
  console.log(`Backend build created at ${distDir}`);
}

build().catch((error) => {
  console.error('Backend build failed:', error);
  process.exitCode = 1;
});
