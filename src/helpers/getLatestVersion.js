// helpers/getLatestVersion.js
import fs from "fs";
import path from "path";

export default function getLatestVersion(baseDir = path.resolve("src")) {
  const items = fs.readdirSync(baseDir, { withFileTypes: true });

  const versions = items
    .filter(d => d.isDirectory() && /^v\d+$/.test(d.name))
    .map(d => Number(d.name.slice(1)));

  if (versions.length === 0) return 1;

  return Math.max(...versions);
};