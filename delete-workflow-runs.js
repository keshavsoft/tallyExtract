import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import deleteWorkflowRuns from 'ks-delete-workflow-runs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Helper to load env variables from a .env file in script directory if it exists
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.length > 0 && value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const pkgPath = path.resolve(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

deleteWorkflowRuns({
  repo: pkg.name,
  token: process.env.GITHUB_TOKEN || process.env.GH_PAT
}).catch(err => {
  console.error('Failed to delete workflow runs:', err.message);
  process.exit(1);
});
