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
 * Recursively parses a keys+ArrayKeys config node into a structured config object.
 *
 * Input shape (same at every level):
 *   keysObj    = { fieldA: "", fieldB: "Array", fieldC: "Expand", ... }
 *   arrayKeysDefs = [ { fieldC: { keys: {...}, ArrayKeys: [...] } }, ... ]
 *
 * Returns a ConfigNode:
 * {
 *   wantedStringKeys: Set<string>   - keys whose string value should be pulled
 *   expandKeys: Set<string>         - keys to recursively expand
 *   allWantedKeys: string[]         - ordered list of all declared keys
 *   arrayKeysMap: Map<string, ConfigNode>  - recursive config per expand key
 * }
 */
export function parseConfigNode({ inKeysObj, inArrayKeysDefs }) {
    const localKeysObj = inKeysObj || {};
    const localArrayKeysDefs = inArrayKeysDefs || [];

    const localWantedStringKeys = new Set();
    const localExpandKeys = new Set();
    const localAllWantedKeys = [];

    for (const [key, directive] of Object.entries(localKeysObj)) {
        localAllWantedKeys.push(key);

        if (directive === "Expand") {
            localExpandKeys.add(key);
        } else if (directive === "Array" || directive === "Object") {
            // Tagged — no action needed beyond tracking key order
        } else {
            // Empty string "" or any sample string value → wanted string key
            localWantedStringKeys.add(key);
        }
    }

    // Recursively parse nested ArrayKeys definitions
    const localArrayKeysMap = new Map();

    for (const defObj of localArrayKeysDefs) {
        for (const [arrayKey, defValue] of Object.entries(defObj)) {
            if (defValue && typeof defValue === "object" && !Array.isArray(defValue) && defValue.keys) {
                // Recursive format: { keys: {...}, ArrayKeys: [...] }
                const localNestedConfig = parseConfigNode({
                    inKeysObj: defValue.keys,
                    inArrayKeysDefs: defValue.ArrayKeys || []
                });
                localArrayKeysMap.set(arrayKey, localNestedConfig);
            } else if (defValue && typeof defValue === "object" && !Array.isArray(defValue) && Object.keys(defValue).length === 0) {
                // Wildcard: {} → pull ALL string values, tag all Arrays/Objects, omit booleans
                localArrayKeysMap.set(arrayKey, {
                    wantedStringKeys: null,   // null = wildcard: accept all strings
                    expandKeys: new Set(),
                    allWantedKeys: [],
                    arrayKeysMap: new Map(),
                    isWildcard: true
                });
            } else if (Array.isArray(defValue)) {
                // Legacy flat list format: ["field1", "field2", ...]
                const localLegacyConfig = parseConfigNode({
                    inKeysObj: Object.fromEntries(defValue.map((f) => [f, ""])),
                    inArrayKeysDefs: []
                });
                localArrayKeysMap.set(arrayKey, localLegacyConfig);
            }
        }
    }

    return {
        wantedStringKeys: localWantedStringKeys,
        expandKeys: localExpandKeys,
        allWantedKeys: localAllWantedKeys,
        arrayKeysMap: localArrayKeysMap,
        isWildcard: false
    };
}

/**
 * Loads want.json and returns:
 * - rootConfig: ConfigNode for the top-level voucher row
 *               (parsed from rootKeys + ArrayKeys)
 */
export function loadWantConfig({ inWantFilePath }) {
    const localWantFilePath = inWantFilePath;

    if (!fs.existsSync(localWantFilePath)) {
        throw new Error(`Want file not found: ${localWantFilePath}`);
    }

    const localContent = fs.readFileSync(localWantFilePath, "utf8");
    const localParsed = JSON.parse(localContent);

    const localRootConfig = parseConfigNode({
        inKeysObj: localParsed.rootKeys || {},
        inArrayKeysDefs: localParsed.ArrayKeys || []
    });

    return localRootConfig;
}

/**
 * Discovers all unique top-level schema keys across all voucher rows:
 * 1. Starts with allWantedKeys from rootConfig (in their original order).
 * 2. Scans every row and appends any Array/Object key not already in the list.
 * (Only applied at the root level for homogeneous output rows.)
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
 * Recursively formats a single object (voucher row or expanded array item)
 * using the provided ConfigNode.
 *
 * Rules (applied at every level the same way):
 *   Key in wantedStringKeys:
 *     string value   → pull exact value
 *     Array          → "Array"
 *     Object         → "Object"
 *     absent/other   → ""
 *   Key in expandKeys:
 *     Array          → recursively format each item using nested ConfigNode
 *     Object         → recursively format the object using nested ConfigNode
 *     absent/other   → ""
 *   Key NOT in wantedStringKeys or expandKeys (discovered key):
 *     Array          → "Array"   (name only, no data)
 *     Object         → "Object"  (name only, no data)
 *     string/boolean → OMIT entirely
 *
 *   All allWantedKeys that are absent in the item → "" (fills declared schema slots)
 *
 * @param {string[]} inKeysList  - ordered list of keys to emit for this item
 *                                 (masterKeysList at root; allWantedKeys at nested)
 * @param {boolean}  inPickOnly  - when true, undeclared Array/Object keys are
 *                                 omitted entirely (pick mode);
 *                                 when false, they are tagged "Array"/"Object" (struct mode)
 */
export function formatNode({ inItem, inKeysList, inConfig, inPickOnly = false }) {
    const localItem = inItem || {};
    const localResult = {};

    // Wildcard mode: pull ALL strings, tag all Arrays/Objects, omit booleans/numbers
    if (inConfig.isWildcard) {
        for (const [key, val] of Object.entries(localItem)) {
            const isArray = Array.isArray(val);
            const isObject = !isArray && typeof val === "object" && val !== null;

            if (isArray) {
                localResult[key] = "Array";
            } else if (isObject) {
                localResult[key] = "Object";
            } else if (typeof val === "string") {
                localResult[key] = val;
            }
            // boolean/number → omit
        }
        return localResult;
    }

    // Process keys that actually exist in the item
    for (const [key, val] of Object.entries(localItem)) {
        const isArray = Array.isArray(val);
        const isObject = !isArray && typeof val === "object" && val !== null;
        const isString = typeof val === "string";

        if (inConfig.expandKeys.has(key)) {
            // Expand: recursively format using the nested ConfigNode
            const localNestedConfig = inConfig.arrayKeysMap.get(key);

            if (!localNestedConfig) {
                // No nested config found → fall back to tag
                localResult[key] = isArray ? "Array" : isObject ? "Object" : "";
            } else if (isArray) {
                localResult[key] = val.map((subItem) =>
                    formatNode({
                        inItem: subItem,
                        inKeysList: localNestedConfig.allWantedKeys,
                        inConfig: localNestedConfig,
                        inPickOnly
                    })
                );
            } else if (isObject) {
                localResult[key] = formatNode({
                    inItem: val,
                    inKeysList: localNestedConfig.allWantedKeys,
                    inConfig: localNestedConfig,
                    inPickOnly
                });
            } else {
                localResult[key] = "";
            }
        } else if (inConfig.wantedStringKeys.has(key)) {
            // Wanted string key: pull value (tag if complex)
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
            // Not declared in this config level:
            // Struct mode: Array/Object → tag; String/Boolean/Number → omit
            // Pick mode:   ALL undeclared keys → omit entirely
            if (!inPickOnly) {
                if (isArray) {
                    localResult[key] = "Array";
                } else if (isObject) {
                    localResult[key] = "Object";
                }
            }
            // else: silently omit in pick mode
        }
    }

    // Fill in all declared keys that were absent in this item
    for (const key of inKeysList) {
        if (!(key in localResult)) {
            localResult[key] = "";
        }
    }

    return localResult;
}

/**
 * Main process:
 * 1. Reads want.json → builds recursive ConfigNode tree.
 * 2. Reads data.json.
 * 3. Collects full union of master keys across all voucher rows (root level only).
 * 4. Formats every row using the recursive formatNode() engine.
 * 5. Writes struct_7.json.
 */
export function generateStruct7File({ inInputFilePath, inWantFilePath, inOutputFilePath }) {
    const localInputFilePath = inInputFilePath;
    const localWantFilePath = inWantFilePath;
    const localOutputFilePath = inOutputFilePath;

    console.log(`[1/4] Loading want config from: ${localWantFilePath}`);
    const localRootConfig = loadWantConfig({ inWantFilePath: localWantFilePath });
    console.log(`- Root wanted string keys:  ${localRootConfig.wantedStringKeys.size}`);
    console.log(`- Root expand keys:         [${[...localRootConfig.expandKeys].join(", ")}]`);
    for (const [key, nested] of localRootConfig.arrayKeysMap.entries()) {
        const localWildcard = nested.isWildcard ? " (WILDCARD: pull all strings)" : "";
        console.log(`  └─ ${key}.keys:           [${nested.allWantedKeys.join(", ")}]${localWildcard}`);
        console.log(`  └─ ${key}.expand keys:     [${[...nested.expandKeys].join(", ")}]`);
        for (const [nestedKey, nestedNested] of nested.arrayKeysMap.entries()) {
            const localNestedWildcard = nestedNested.isWildcard ? " (WILDCARD: pull all strings)" : "";
            console.log(`     └─ ${nestedKey}.keys: [${nestedNested.allWantedKeys.join(", ")}]${localNestedWildcard}`);
        }
    }

    console.log(`[2/4] Reading UTF-16 LE file: ${localInputFilePath}`);
    console.time("Read & Parse");
    const localRawData = readUtf16LeJson({ inFilePath: localInputFilePath });
    console.timeEnd("Read & Parse");

    const localVouchers = localRawData.tallymessage || [];
    console.log(`- Total vouchers found: ${localVouchers.length}`);

    console.log(`[3/4] Collecting master key list across all voucher rows...`);
    console.time("Collect Master Keys");
    const localMasterKeys = collectMasterKeys({
        inVouchers: localVouchers,
        inAllWantedKeys: localRootConfig.allWantedKeys
    });
    console.timeEnd("Collect Master Keys");
    console.log(`- Total uniform keys per row: ${localMasterKeys.length}`);
    console.log(`- Keys: ${localMasterKeys.join(", ")}`);

    console.log(`[4/4] Formatting all rows (Version 7 recursive engine)...`);
    console.time("Format Rows");
    const localRowsArray = localVouchers.map((row) =>
        formatNode({
            inItem: row,
            inKeysList: localMasterKeys,
            inConfig: localRootConfig
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
    console.log(`- Keys in every root row:      ${localMasterKeys.length} (100% homogeneous)`);
    console.log(`- ${localOutputBasename} file size:     ${localOutputSizeMb} MB`);

    return localRowsArray;
}

// Auto-run only when executed directly (not when imported as a module)
const __isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (__isMain) {
    const DEFAULT_INPUT = path.join(__dirname, "data.json");
    const DEFAULT_WANT = path.join(__dirname, "want.json");
    const DEFAULT_OUTPUT = path.join(__dirname, "struct_7.json");

    generateStruct7File({
        inInputFilePath: DEFAULT_INPUT,
        inWantFilePath: DEFAULT_WANT,
        inOutputFilePath: DEFAULT_OUTPUT
    });
}
