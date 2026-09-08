import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readUtf16LeJson, loadWantConfig, formatNode } from "./read_struct_7.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * "Pick" mode: outputs ONLY the keys explicitly declared in rootKeys of want.json.
 *
 * Unlike the struct engine (which auto-discovers any Array/Object key across
 * all rows and adds them to the master list), pick mode uses ONLY the declared
 * keys as the output schema. No auto-discovery, no extras.
 *
 * All formatting rules (string pull, Array/Object tagging, Expand recursion)
 * are identical to the struct engine.
 */
export function generatePickFile({ inInputFilePath, inWantFilePath, inOutputFilePath }) {
    const localInputFilePath = inInputFilePath;
    const localWantFilePath = inWantFilePath;
    const localOutputFilePath = inOutputFilePath;

    console.log(`[1/3] Loading want config from: ${localWantFilePath}`);
    const localRootConfig = loadWantConfig({ inWantFilePath: localWantFilePath });

    // Pick mode: use ONLY the declared keys — no auto-discovery scan
    const localPickKeys = localRootConfig.allWantedKeys;

    console.log(`- Declared keys (pick only): ${localPickKeys.length}`);
    console.log(`- Keys: ${localPickKeys.join(", ")}`);
    console.log(`- Expand keys: [${[...localRootConfig.expandKeys].join(", ")}]`);
    for (const [key, nested] of localRootConfig.arrayKeysMap.entries()) {
        const localWildcard = nested.isWildcard ? " (WILDCARD)" : "";
        console.log(`  └─ ${key}.keys: [${nested.allWantedKeys.join(", ")}]${localWildcard}`);
        for (const [nk, nn] of nested.arrayKeysMap.entries()) {
            const localNW = nn.isWildcard ? " (WILDCARD)" : "";
            console.log(`     └─ ${nk}.keys: [${nn.allWantedKeys.join(", ")}]${localNW}`);
        }
    }

    console.log(`[2/3] Reading UTF-16 LE file: ${localInputFilePath}`);
    console.time("Read & Parse");
    const localRawData = readUtf16LeJson({ inFilePath: localInputFilePath });
    console.timeEnd("Read & Parse");

    const localVouchers = localRawData.tallymessage || [];
    console.log(`- Total vouchers found: ${localVouchers.length}`);

    console.log(`[3/3] Formatting all rows (pick mode — declared keys only)...`);
    console.time("Format Rows");
    const localRowsArray = localVouchers.map((row) =>
        formatNode({
            inItem: row,
            inKeysList: localPickKeys,
            inConfig: localRootConfig,
            inPickOnly: true        // omit ALL undeclared keys at every level
        })
    );
    console.timeEnd("Format Rows");

    console.log(`Writing output to: ${localOutputFilePath}`);
    console.time("Write File");
    fs.writeFileSync(
        localOutputFilePath,
        JSON.stringify(localRowsArray, null, 2),
        "utf8"
    );
    console.timeEnd("Write File");

    const localOutputSizeMb = (fs.statSync(localOutputFilePath).size / (1024 * 1024)).toFixed(2);
    const localOutputBasename = path.basename(localOutputFilePath);
    console.log(`Done!`);
    console.log(`- Total rows in ${localOutputBasename}: ${localRowsArray.length}`);
    console.log(`- Keys in every row:           ${localPickKeys.length} (pick — declared only)`);
    console.log(`- ${localOutputBasename} file size:     ${localOutputSizeMb} MB`);

    return localRowsArray;
}

// Auto-run when executed directly
const __isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (__isMain) {
    generatePickFile({
        inInputFilePath: path.join(__dirname, "data.json"),
        inWantFilePath: path.join(__dirname, "want.json"),
        inOutputFilePath: path.join(__dirname, "pick.json")
    });
}
