#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function log(message, color = RESET) {
  console.log(`${color}${message}${RESET}`);
}

function logStep(step, message) {
  console.log(`\n${CYAN}[${step}]${RESET} ${message}`);
}

function copyRecursiveSync(src, dest, excludeList = []) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      // Skip excluded items
      if (excludeList.includes(childItemName)) {
        return;
      }
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName),
        excludeList
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function main() {
  console.log(`
${BOLD}${CYAN}
 ███╗   ██╗██╗  ██╗ ██████╗ ██████╗ ██████╗ ███████╗
 ████╗  ██║╚██╗██╔╝██╔════╝██╔═══██╗██╔══██╗██╔════╝
 ██╔██╗ ██║ ╚███╔╝ ██║     ██║   ██║██████╔╝█████╗  
 ██║╚██╗██║ ██╔██╗ ██║     ██║   ██║██╔══██╗██╔══╝  
 ██║ ╚████║██╔╝ ██╗╚██████╗╚██████╔╝██║  ██║███████╗
 ╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
${RESET}
${BOLD}NXCore${RESET} - Next.js Enterprise Starter Kit
${YELLOW}Version 1.0.0${RESET}
`);

  // Get project name
  let projectName = process.argv[2];
  
  if (!projectName) {
    projectName = await question(`${CYAN}? ${RESET}What is your project name? ${BOLD}(my-nxcore-app)${RESET}: `);
    projectName = projectName.trim() || 'my-nxcore-app';
  }

  // Validate project name
  const validName = /^[a-zA-Z0-9-_]+$/;
  if (!validName.test(projectName)) {
    log('\n❌ Project name can only contain letters, numbers, hyphens, and underscores.', RED);
    rl.close();
    process.exit(1);
  }

  const targetPath = path.join(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(targetPath)) {
    const overwrite = await question(`${YELLOW}? ${RESET}Directory ${projectName} already exists. Overwrite? ${BOLD}(y/N)${RESET}: `);
    if (overwrite.toLowerCase() !== 'y') {
      log('\n❌ Installation cancelled.', RED);
      rl.close();
      process.exit(1);
    }
    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  rl.close();

  // Get template path (the root of the package)
  const templatePath = path.join(__dirname, '..');

  logStep('1/4', `Creating project ${BOLD}${projectName}${RESET}...`);
  
  // Items to exclude from copying
  const excludeList = [
    'node_modules',
    '.git',
    '.next',
    'bin',
    '.env.local',
    '.env',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml'
  ];

  // Copy template files
  copyRecursiveSync(templatePath, targetPath, excludeList);

  // Create .env.example from .env.local structure
  const envExampleContent = `# App Configuration
NEXT_PUBLIC_APP_NAME="Your App Name"
NEXT_PUBLIC_APP_DESCRIPTION="Your app description"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_API_VERSION="v1"
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
PORT=3000

# Node.js SSL Configuration (for development only)
NODE_TLS_REJECT_UNAUTHORIZED=0

# iDempiere API Configuration (Optional)
IDEMPIERE_API_URL="https://your-idempiere-server:8443/api/v1"
IDEMPIERE_API_USERNAME="SuperUser"
IDEMPIERE_API_PASSWORD="your_password"
IDEMPIERE_API_CLIENT_ID="1000000"
IDEMPIERE_API_ROLE_ID="1000000"
IDEMPIERE_API_ORG_ID="1000000"
IDEMPIERE_API_WAREHOUSE_ID="1000000"

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/your_database"

# AUTH.JS / NEXTAUTH v5+
AUTH_SECRET="" # Generate with: openssl rand -base64 32
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true

# Encryption
ENCRYPTION_KEY="" # Generate with: openssl rand -base64 32
`;

  fs.writeFileSync(path.join(targetPath, '.env.example'), envExampleContent);
  fs.writeFileSync(path.join(targetPath, '.env.local'), envExampleContent);

  // Update package.json for the new project
  const newPackageJsonPath = path.join(targetPath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(newPackageJsonPath, 'utf8'));
  
  // Remove CLI-specific fields
  delete packageJson.bin;
  delete packageJson.files;
  delete packageJson.keywords;
  delete packageJson.author;
  delete packageJson.license;
  delete packageJson.repository;
  delete packageJson.bugs;
  delete packageJson.homepage;
  delete packageJson.publishConfig;
  
  // Update for new project
  packageJson.name = projectName;
  packageJson.version = '0.1.0';
  packageJson.private = true;
  packageJson.description = `${projectName} - Created with create-nxcore`;

  fs.writeFileSync(newPackageJsonPath, JSON.stringify(packageJson, null, 2));

  logStep('2/4', 'Installing dependencies...');
  
  try {
    // Detect package manager
    const userAgent = process.env.npm_config_user_agent || '';
    let packageManager = 'npm';
    let installCommand = 'npm install';
    
    if (userAgent.includes('yarn')) {
      packageManager = 'yarn';
      installCommand = 'yarn';
    } else if (userAgent.includes('pnpm')) {
      packageManager = 'pnpm';
      installCommand = 'pnpm install';
    }

    execSync(installCommand, { 
      cwd: targetPath, 
      stdio: 'inherit' 
    });
  } catch (error) {
    log('\n⚠️  Failed to install dependencies. Please run npm install manually.', YELLOW);
  }

  logStep('3/4', 'Initializing git repository...');
  
  try {
    execSync('git init', { cwd: targetPath, stdio: 'pipe' });
    execSync('git add .', { cwd: targetPath, stdio: 'pipe' });
    execSync('git commit -m "Initial commit from create-nxcore"', { 
      cwd: targetPath, 
      stdio: 'pipe' 
    });
    log('   ✓ Git repository initialized', GREEN);
  } catch (error) {
    log('   ⚠️  Git initialization skipped (git may not be installed)', YELLOW);
  }

  logStep('4/4', 'Project created successfully!');

  console.log(`
${GREEN}${BOLD}✓ Success!${RESET} Created ${BOLD}${projectName}${RESET} at ${targetPath}

${BOLD}Inside that directory, you can run:${RESET}

  ${CYAN}npm run dev${RESET}
    Starts the development server on port 2000.

  ${CYAN}npm run build${RESET}
    Builds the app for production.

  ${CYAN}npm run start${RESET}
    Runs the built app in production mode.

${BOLD}Get started:${RESET}

  ${CYAN}cd ${projectName}${RESET}
  ${CYAN}npm run dev${RESET}

${BOLD}Project Structure:${RESET}

  ${YELLOW}app/${RESET}         - Next.js App Router pages
  ${YELLOW}features/${RESET}    - Feature-based modules (auth, menu, etc.)
  ${YELLOW}shared/${RESET}      - Shared components, hooks, and utilities
  ${YELLOW}core/${RESET}        - Core configuration (auth, store, providers)
  ${YELLOW}assets/${RESET}      - Global styles and assets

${BOLD}Documentation:${RESET}

  Read ${CYAN}features/ARCHITECTURE.md${RESET} for detailed project structure.

${BLUE}Happy coding! 🚀${RESET}
`);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
