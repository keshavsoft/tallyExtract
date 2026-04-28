// scripts/updateIndex.js
import fs from "fs";
import path from "path";

import getLatestVersion from "../helpers/getLatestVersion.js";

const latest = getLatestVersion("./src");

const rootIndex = path.resolve("./index.js");

fs.writeFileSync(
  rootIndex,
  `export * from "./src/v${latest}/index.js";\n`
);

console.log("Updated to v" + latest);