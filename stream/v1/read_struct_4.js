import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads a UTF-16 LE encoded JSON file directly, stripping the BOM (\uFEFF) if present.
 */
export function readUtf16LeJson({ inFilePath }) {
    const localFilePath = inFilePath;

    let localContent = fs.readFileSync(localFilePath, "utf16le");

    if (localContent.charCodeAt(0) === 0xFEFF) {
        localContent = localContent.slice(1);
    }

    const localData = JSON.parse(localContent);
    return localData;
}

/**
 * Loads want.json and returns two sets:
 * - wantedStringKeys: keys whose value is a plain string (not "Array", "Object", or "Expand")
 * - expandKeys: keys whose value is "Expand" (full nested content will be pulled)
 * - arrayTagKeys: keys whose value is "Array" or "Object" (tagged but not expanded)
 *
 * Any key present in want.json is included in one of these sets.
 */
export function loadWantConfig({ inWantFilePath }) {
    const localWantFilePath = inWantFilePath;

    if (!fs.existsSync(localWantFilePath)) {
        throw new Error(`Want file not found: ${localWantFilePath}`);
    }

    const localContent = fs.readFileSync(localWantFilePath, "utf8");
    const localParsed = JSON.parse(localContent);

    const localWantedStringKeys = new Set();
    const localExpandKeys = new Set();
    const localArrayTagKeys = new Set();
    const localAllWantedKeys = [];

    const localEntries = Array.isArray(localParsed)
        ? localParsed.map((k) => [k, "string"])
        : Object.entries(localParsed);

    for (const [key, directive] of localEntries) {
        localAllWantedKeys.push(key);

        if (directive === "Expand") {
            localExpandKeys.add(key);
        } else if (directive === "Array" || directive === "Object") {
            localArrayTagKeys.add(key);
        } else {
            // Plain string sample value → treat as wanted string key
            localWantedStringKeys.add(key);
        }
    }

    return {
        wantedStringKeys: localWantedStringKeys,
        expandKeys: localExpandKeys,
        arrayTagKeys: localArrayTagKeys,
        allWantedKeys: localAllWantedKeys
    };
}

/**
 * Recursively applies struct-3 style formatting to an expanded node:
 * - Arrays → recursively format each element
 * - Objects → recursively format all values
 *   - String values are always pulled
 *   - Boolean/number values are omitted
 *   - Nested Arrays/Objects are tagged "Array" / "Object" (no further expansion)
 */
export function formatExpandedNode({ inNode }) {
    const localNode = inNode;

    if (Array.isArray(localNode)) {
        return localNode.map((item) => formatExpandedNode({ inNode: item }));
    }

    if (typeof localNode === "object" && localNode !== null) {
        const localResult = {};

        for (const [key, val] of Object.entries(localNode)) {
            if (Array.isArray(val)) {
                // Tag nested arrays — do NOT recurse further
                localResult[key] = "Array";
            } else if (typeof val === "object" && val !== null) {
                // Tag nested objects — do NOT recurse further
                localResult[key] = "Object";
            } else if (typeof val === "string") {
                // Always pull string values inside expanded nodes
                localResult[key] = val;
            }
            // Booleans and numbers inside expanded nodes are omitted
        }

        return localResult;
    }

    // Primitive (string or other): return as-is
    return localNode;
}

/**
 * Discovers all unique schema keys across all rows:
 * 1. Starts with all keys from want.json (in their original order).
 * 2. Scans every row and appends any Array/Object key not already in the master list.
 */
export function collectMasterKeys({ inVouchers, inAllWantedKeys }) {
    const localMasterKeysSet = new Set(inAllWantedKeys);

    for (const voucher of inVouchers) {
        if (!voucher || typeof voucher !== "object") continue;

        for (const [key, val] of Object.entries(voucher)) {
            if (Array.isArray(val) || (typeof val === "object" && val !== null)) {
                localMasterKeysSet.add(key);
            }
        }
    }

    return Array.from(localMasterKeysSet);
}

/**
 * Formats a single voucher row (Version 4 rules):
 *
 * For keys present in want.json:
 *   - Directive = plain string value  → pull actual string value from the row
 *   - Directive = "Array" / "Object"  → tag as "Array" / "Object" (no expansion)
 *   - Directive = "Expand"            → pull full nested content via formatExpandedNode()
 *
 * For all other keys in the row:
 *   - Array  → tag as "Array"
 *   - Object → tag as "Object"
 *   - String / Boolean / anything else → omit
 *
 * Keys absent in this row → "" (empty string) — ensuring homogeneous schema.
 */
export function formatRowStruct4({ inRow, inMasterKeysList, inWantedStringKeys, inExpandKeys }) {
    const localRow = inRow || {};
    const localResult = {};

    for (const key of inMasterKeysList) {
        if (!(key in localRow) || localRow[key] === undefined || localRow[key] === null) {
            localResult[key] = "";
            continue;
        }

        const val = localRow[key];

        if (inExpandKeys.has(key)) {
            // "Expand" directive: pull full nested content recursively
            localResult[key] = formatExpandedNode({ inNode: val });
        } else if (Array.isArray(val)) {
            localResult[key] = "Array";
        } else if (typeof val === "object") {
            localResult[key] = "Object";
        } else if (typeof val === "string") {
            if (inWantedStringKeys.has(key)) {
                // Wanted string key → pull exact value
                localResult[key] = val;
            }
            // Unwanted string key → omit (key still present as "" via master key loop)
            else {
                localResult[key] = "";
            }
        } else {
            // Boolean, number, etc. → omit
            localResult[key] = "";
        }
    }

    return localResult;
}

/**
 * Main process:
 * 1. Reads want.json to determine key directives (string / Array / Object / Expand).
 * 2. Reads data.json.
 * 3. Collects the full union of master keys across all rows.
 * 4. Normalizes every row to this uniform schema using Version 4 rules.
 * 5. Writes struct_4.json.
 */
export function generateStruct4File({ inInputFilePath, inWantFilePath, inOutputFilePath }) {
    const localInputFilePath = inInputFilePath;
    const localWantFilePath = inWantFilePath;
    const localOutputFilePath = inOutputFilePath;

    console.log(`[1/4] Loading want config from: ${localWantFilePath}`);
    const localWantConfig = loadWantConfig({ inWantFilePath: localWantFilePath });
    console.log(`- Wanted string keys:  ${localWantConfig.wantedStringKeys.size}`);
    console.log(`- Expand keys:         ${localWantConfig.expandKeys.size} → [${[...localWantConfig.expandKeys].join(", ")}]`);
    console.log(`- Array/Object tagged: ${localWantConfig.arrayTagKeys.size}`);

    console.log(`[2/4] Reading UTF-16 LE file: ${localInputFilePath}`);
    console.time("Read & Parse");
    const localRawData = readUtf16LeJson({ inFilePath: localInputFilePath });
    console.timeEnd("Read & Parse");

    const localVouchers = localRawData.tallymessage || [];
    console.log(`- Total vouchers found: ${localVouchers.length}`);

    console.log(`[3/4] Collecting master key list across all rows...`);
    console.time("Collect Master Keys");
    const localMasterKeys = collectMasterKeys({
        inVouchers: localVouchers,
        inAllWantedKeys: localWantConfig.allWantedKeys
    });
    console.timeEnd("Collect Master Keys");
    console.log(`- Total uniform keys per row: ${localMasterKeys.length}`);
    console.log(`- Keys: ${localMasterKeys.join(", ")}`);

    console.log(`[4/4] Formatting all rows (Version 4 rules)...`);
    console.time("Format Rows");
    const localRowsArray = localVouchers.map((row) =>
        formatRowStruct4({
            inRow: row,
            inMasterKeysList: localMasterKeys,
            inWantedStringKeys: localWantConfig.wantedStringKeys,
            inExpandKeys: localWantConfig.expandKeys
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
    console.log(`Done!`);
    console.log(`- Total rows in struct_4.json: ${localRowsArray.length}`);
    console.log(`- Keys in every row:           ${localMasterKeys.length} (100% homogeneous)`);
    console.log(`- struct_4.json file size:     ${localOutputSizeMb} MB`);

    return localRowsArray;
}

// Auto-run when executed directly
const DEFAULT_INPUT = path.join(__dirname, "data.json");
const DEFAULT_WANT = path.join(__dirname, "want.json");
const DEFAULT_OUTPUT = path.join(__dirname, "struct_4.json");

generateStruct4File({
    inInputFilePath: DEFAULT_INPUT,
    inWantFilePath: DEFAULT_WANT,
    inOutputFilePath: DEFAULT_OUTPUT
});
