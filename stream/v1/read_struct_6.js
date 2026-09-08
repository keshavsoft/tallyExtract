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
 * Parses the want.json structure (rootKeys + ArrayKeys).
 *
 * Returns:
 * {
 *   wantedStringKeys: Set<string>   - rootKeys: pull string value
 *   expandKeys: Set<string>         - rootKeys: expand using ArrayKeys rules
 *   allWantedKeys: string[]         - rootKeys: ordered list of all keys
 *   arrayKeysMap: Map<string, Set<string>>  - per expand key: which sub-fields are "wanted string keys"
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

    const localWantedStringKeys = new Set();
    const localExpandKeys = new Set();
    const localAllWantedKeys = [];

    for (const [key, directive] of Object.entries(localRootKeys)) {
        localAllWantedKeys.push(key);

        if (directive === "Expand") {
            localExpandKeys.add(key);
        } else if (directive !== "Array" && directive !== "Object") {
            // Plain sample string value → wanted string key
            localWantedStringKeys.add(key);
        }
        // "Array" / "Object" directive → just tag, already handled by default
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
        allWantedKeys: localAllWantedKeys,
        arrayKeysMap: localArrayKeysMap
    };
}

/**
 * Discovers all unique schema keys across all rows (for homogeneous output):
 * 1. Starts with all rootKeys in their original order.
 * 2. Scans every row and appends any Array/Object key not already in the list.
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
 * Formats a single item inside an Expand array (Version 6 rules).
 *
 * Applies the SAME rootKeys-style logic to each item:
 *   - Key is in allowedFields (from ArrayKeys)  → pull string value
 *   - Key is NOT in allowedFields:
 *       value is Array  → show key, tag as "Array"  (no data)
 *       value is Object → show key, tag as "Object" (no data)
 *       value is string / boolean / number → OMIT entirely
 *   - Key is in allowedFields but absent in item → ""
 */
export function formatArrayItem({ inItem, inAllowedFields }) {
    if (!inItem || typeof inItem !== "object" || Array.isArray(inItem)) {
        return inItem;
    }

    const localResult = {};

    for (const [key, val] of Object.entries(inItem)) {
        const isArray = Array.isArray(val);
        const isObject = !isArray && typeof val === "object" && val !== null;
        const isString = typeof val === "string";

        if (inAllowedFields.has(key)) {
            // Listed field → pull the actual string value (or tag if complex)
            if (isArray) {
                localResult[key] = "Array";
            } else if (isObject) {
                localResult[key] = "Object";
            } else if (isString) {
                localResult[key] = val;
            } else {
                localResult[key] = "";
            }
        } else {
            // NOT listed:
            // Array/Object → show key tagged ("Array" / "Object"), no data
            // String/Boolean/Number → OMIT entirely
            if (isArray) {
                localResult[key] = "Array";
            } else if (isObject) {
                localResult[key] = "Object";
            }
            // else: omit silently
        }
    }

    // Ensure all allowedFields are present (even if absent in this item)
    for (const field of inAllowedFields) {
        if (!(field in localResult)) {
            localResult[field] = "";
        }
    }

    return localResult;
}

/**
 * Formats a single voucher row (Version 6 rules).
 *
 * rootKeys directives at the top level:
 *   - Plain string directive → pull actual string value
 *   - "Array" / "Object" → tag as "Array" / "Object"
 *   - "Expand" → expand array items using formatArrayItem() with ArrayKeys rules
 *
 * Keys NOT in rootKeys (discovered via collectMasterKeys):
 *   - Array  → "Array"
 *   - Object → "Object"
 *   - String/Boolean → ""
 *
 * Missing keys in this row → "" (guarantees homogeneous schema)
 */
export function formatRowStruct6({ inRow, inMasterKeysList, inWantedStringKeys, inExpandKeys, inArrayKeysMap }) {
    const localRow = inRow || {};
    const localResult = {};

    for (const key of inMasterKeysList) {
        if (!(key in localRow) || localRow[key] === undefined || localRow[key] === null) {
            localResult[key] = "";
            continue;
        }

        const val = localRow[key];

        if (inExpandKeys.has(key)) {
            // "Expand" directive: expand array items with ArrayKeys field rules
            const localAllowedFields = inArrayKeysMap.get(key);

            if (!localAllowedFields) {
                // No ArrayKeys definition → fall back to tag
                localResult[key] = Array.isArray(val) ? "Array" : "Object";
            } else if (Array.isArray(val)) {
                localResult[key] = val.map((item) =>
                    formatArrayItem({ inItem: item, inAllowedFields: localAllowedFields })
                );
            } else {
                localResult[key] = "Object";
            }
        } else if (Array.isArray(val)) {
            localResult[key] = "Array";
        } else if (typeof val === "object") {
            localResult[key] = "Object";
        } else if (typeof val === "string") {
            localResult[key] = inWantedStringKeys.has(key) ? val : "";
        } else {
            localResult[key] = "";
        }
    }

    return localResult;
}

/**
 * Main process:
 * 1. Reads want.json (rootKeys + ArrayKeys).
 * 2. Reads data.json.
 * 3. Collects full union of master keys across all rows.
 * 4. Normalizes every row using Version 6 rules.
 * 5. Writes struct_6.json.
 */
export function generateStruct6File({ inInputFilePath, inWantFilePath, inOutputFilePath }) {
    const localInputFilePath = inInputFilePath;
    const localWantFilePath = inWantFilePath;
    const localOutputFilePath = inOutputFilePath;

    console.log(`[1/4] Loading want config from: ${localWantFilePath}`);
    const localWantConfig = loadWantConfig({ inWantFilePath: localWantFilePath });
    console.log(`- Wanted string keys:  ${localWantConfig.wantedStringKeys.size}`);
    console.log(`- Expand keys:         ${localWantConfig.expandKeys.size} → [${[...localWantConfig.expandKeys].join(", ")}]`);
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

    console.log(`[4/4] Formatting all rows (Version 6 rules)...`);
    console.time("Format Rows");
    const localRowsArray = localVouchers.map((row) =>
        formatRowStruct6({
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
    console.log(`- Total rows in struct_6.json: ${localRowsArray.length}`);
    console.log(`- Keys in every row:           ${localMasterKeys.length} (100% homogeneous)`);
    console.log(`- struct_6.json file size:     ${localOutputSizeMb} MB`);

    return localRowsArray;
}

// Auto-run when executed directly
const DEFAULT_INPUT = path.join(__dirname, "data.json");
const DEFAULT_WANT = path.join(__dirname, "want.json");
const DEFAULT_OUTPUT = path.join(__dirname, "struct_6.json");

generateStruct6File({
    inInputFilePath: DEFAULT_INPUT,
    inWantFilePath: DEFAULT_WANT,
    inOutputFilePath: DEFAULT_OUTPUT
});
