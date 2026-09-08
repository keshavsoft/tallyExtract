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
 * Parses the new want.json structure:
 *
 * {
 *   "rootKeys": {
 *     "date": "...",           // plain string value → wanted string key
 *     "allledgerentries": "Array",  // → tag as "Array"
 *     "allinventoryentries": "Expand" // → expand with ArrayKeys rules
 *   },
 *   "ArrayKeys": [
 *     {
 *       "allinventoryentries": ["stockitemname", "rate", "amount", "actualqty", "billedqty"]
 *     }
 *   ]
 * }
 *
 * Returns:
 * {
 *   wantedStringKeys: Set<string>  - keys to pull string values for
 *   expandKeys: Set<string>        - keys to expand (uses ArrayKeys rules)
 *   arrayTagKeys: Set<string>      - keys to tag as "Array" / "Object"
 *   allWantedKeys: string[]        - ordered list of all rootKeys
 *   arrayKeysMap: Map<string, Set<string>>  - per-expand-key: which sub-fields to pull
 * }
 */
export function loadWantConfig({ inWantFilePath }) {
    const localWantFilePath = inWantFilePath;

    if (!fs.existsSync(localWantFilePath)) {
        throw new Error(`Want file not found: ${localWantFilePath}`);
    }

    const localContent = fs.readFileSync(localWantFilePath, "utf8");
    const localParsed = JSON.parse(localContent);

    const localRootKeys = localParsed.rootKeys || {};
    const localArrayKeysDefs = localParsed.ArrayKeys || [];

    // Parse rootKeys directives
    const localWantedStringKeys = new Set();
    const localExpandKeys = new Set();
    const localArrayTagKeys = new Set();
    const localAllWantedKeys = [];

    for (const [key, directive] of Object.entries(localRootKeys)) {
        localAllWantedKeys.push(key);

        if (directive === "Expand") {
            localExpandKeys.add(key);
        } else if (directive === "Array" || directive === "Object") {
            localArrayTagKeys.add(key);
        } else {
            // Plain string sample value → wanted string key
            localWantedStringKeys.add(key);
        }
    }

    // Build arrayKeysMap: { "allinventoryentries" => Set(["stockitemname", "rate", ...]) }
    const localArrayKeysMap = new Map();
    for (const defObj of localArrayKeysDefs) {
        for (const [arrayKey, fieldList] of Object.entries(defObj)) {
            localArrayKeysMap.set(arrayKey, new Set(fieldList));
        }
    }

    return {
        wantedStringKeys: localWantedStringKeys,
        expandKeys: localExpandKeys,
        arrayTagKeys: localArrayTagKeys,
        allWantedKeys: localAllWantedKeys,
        arrayKeysMap: localArrayKeysMap
    };
}

/**
 * Discovers all unique schema keys across all rows:
 * 1. Starts with all rootKeys from want.json (in their original order).
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
 * Formats a single item inside an Expand array using rootKeys-style rules,
 * but ONLY for the specific fields listed in ArrayKeys for that array key.
 *
 * Rules applied to each listed field:
 * - String value → pull exact value
 * - Array → "Array"
 * - Object → "Object"
 * - Absent → ""
 * - Everything else → ""
 *
 * All other fields in the item (not in the listed set) are omitted entirely.
 */
export function formatArrayItem({ inItem, inAllowedFields }) {
    if (!inItem || typeof inItem !== "object" || Array.isArray(inItem)) {
        return inItem;
    }

    const localResult = {};

    for (const field of inAllowedFields) {
        if (!(field in inItem) || inItem[field] === undefined || inItem[field] === null) {
            localResult[field] = "";
        } else {
            const val = inItem[field];

            if (Array.isArray(val)) {
                localResult[field] = "Array";
            } else if (typeof val === "object") {
                localResult[field] = "Object";
            } else if (typeof val === "string") {
                localResult[field] = val;
            } else {
                // boolean, number, etc.
                localResult[field] = "";
            }
        }
    }

    return localResult;
}

/**
 * Formats a single voucher row (Version 5 rules):
 *
 * rootKeys directives applied at the top level:
 *   - Directive = plain string value → pull actual string value from the row
 *   - Directive = "Array" / "Object" → tag as "Array" / "Object"
 *   - Directive = "Expand" → expand the array using ArrayKeys rules
 *     (only the fields listed in ArrayKeys for that key are pulled per item)
 *
 * For all other keys NOT in rootKeys (discovered via collectMasterKeys):
 *   - Array  → "Array"
 *   - Object → "Object"
 *   - Anything else → "" (omit)
 *
 * Keys absent in this row → "" (homogeneous schema guaranteed)
 */
export function formatRowStruct5({ inRow, inMasterKeysList, inWantedStringKeys, inExpandKeys, inArrayKeysMap }) {
    const localRow = inRow || {};
    const localResult = {};

    for (const key of inMasterKeysList) {
        if (!(key in localRow) || localRow[key] === undefined || localRow[key] === null) {
            localResult[key] = "";
            continue;
        }

        const val = localRow[key];

        if (inExpandKeys.has(key)) {
            // "Expand" directive: expand the array using ArrayKeys sub-field rules
            const localAllowedFields = inArrayKeysMap.get(key);

            if (!localAllowedFields) {
                // No ArrayKeys definition for this expand key → fall back to "Array" tag
                localResult[key] = Array.isArray(val) ? "Array" : "Object";
            } else if (Array.isArray(val)) {
                localResult[key] = val.map((item) =>
                    formatArrayItem({ inItem: item, inAllowedFields: localAllowedFields })
                );
            } else {
                // Expand was expected on an array but got object → tag it
                localResult[key] = "Object";
            }
        } else if (Array.isArray(val)) {
            localResult[key] = "Array";
        } else if (typeof val === "object") {
            localResult[key] = "Object";
        } else if (typeof val === "string") {
            if (inWantedStringKeys.has(key)) {
                localResult[key] = val;
            } else {
                localResult[key] = "";
            }
        } else {
            localResult[key] = "";
        }
    }

    return localResult;
}

/**
 * Main process:
 * 1. Reads want.json (rootKeys + ArrayKeys structure).
 * 2. Reads data.json.
 * 3. Collects full union of master keys across all rows.
 * 4. Normalizes every row using Version 5 rules.
 * 5. Writes struct_5.json.
 */
export function generateStruct5File({ inInputFilePath, inWantFilePath, inOutputFilePath }) {
    const localInputFilePath = inInputFilePath;
    const localWantFilePath = inWantFilePath;
    const localOutputFilePath = inOutputFilePath;

    console.log(`[1/4] Loading want config from: ${localWantFilePath}`);
    const localWantConfig = loadWantConfig({ inWantFilePath: localWantFilePath });
    console.log(`- Wanted string keys:  ${localWantConfig.wantedStringKeys.size}`);
    console.log(`- Expand keys:         ${localWantConfig.expandKeys.size} → [${[...localWantConfig.expandKeys].join(", ")}]`);
    console.log(`- Array/Object tagged: ${localWantConfig.arrayTagKeys.size}`);
    for (const [key, fields] of localWantConfig.arrayKeysMap.entries()) {
        console.log(`- ArrayKeys[${key}]:    [${[...fields].join(", ")}]`);
    }

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

    console.log(`[4/4] Formatting all rows (Version 5 rules)...`);
    console.time("Format Rows");
    const localRowsArray = localVouchers.map((row) =>
        formatRowStruct5({
            inRow: row,
            inMasterKeysList: localMasterKeys,
            inWantedStringKeys: localWantConfig.wantedStringKeys,
            inExpandKeys: localWantConfig.expandKeys,
            inArrayKeysMap: localWantConfig.arrayKeysMap
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
    console.log(`- Total rows in struct_5.json: ${localRowsArray.length}`);
    console.log(`- Keys in every row:           ${localMasterKeys.length} (100% homogeneous)`);
    console.log(`- struct_5.json file size:     ${localOutputSizeMb} MB`);

    return localRowsArray;
}

// Auto-run when executed directly
const DEFAULT_INPUT = path.join(__dirname, "data.json");
const DEFAULT_WANT = path.join(__dirname, "want.json");
const DEFAULT_OUTPUT = path.join(__dirname, "struct_5.json");

generateStruct5File({
    inInputFilePath: DEFAULT_INPUT,
    inWantFilePath: DEFAULT_WANT,
    inOutputFilePath: DEFAULT_OUTPUT
});
