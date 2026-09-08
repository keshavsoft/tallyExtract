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
 * Loads the base keys from want.json while preserving order.
 */
export function loadWantedKeys({ inWantFilePath }) {
    const localWantFilePath = inWantFilePath;

    if (!fs.existsSync(localWantFilePath)) {
        throw new Error(`Want file not found: ${localWantFilePath}`);
    }

    const localContent = fs.readFileSync(localWantFilePath, "utf8");
    const localParsed = JSON.parse(localContent);

    const localKeysArray = Array.isArray(localParsed)
        ? localParsed
        : Object.keys(localParsed);

    return localKeysArray;
}

/**
 * Discovers all unique keys across all rows in data.json:
 * 1. Begins with all keys explicitly listed in want.json (in their original order).
 * 2. Scans every row in the dataset and appends any key whose value is an Array or Object.
 */
export function collectMasterKeys({ inVouchers, inWantedKeysList }) {
    const masterKeysSet = new Set(inWantedKeysList);

    for (const voucher of inVouchers) {
        if (!voucher || typeof voucher !== "object") continue;

        for (const [key, val] of Object.entries(voucher)) {
            if (Array.isArray(val) || (typeof val === "object" && val !== null)) {
                masterKeysSet.add(key);
            }
        }
    }

    return Array.from(masterKeysSet);
}

/**
 * Formats a single voucher row so every row is completely homogeneous:
 * - Every row will have the exact same keys in the exact same order.
 * - If key is an Array -> "Array"
 * - If key is an Object -> "Object"
 * - If key is a String -> row[key]
 * - If key is not present in this row -> "" (empty string)
 */
export function formatRowStruct3({ inRow, inMasterKeysList }) {
    const localRow = inRow || {};
    const localResult = {};

    for (const key of inMasterKeysList) {
        if (!(key in localRow) || localRow[key] === undefined || localRow[key] === null) {
            localResult[key] = "";
        } else {
            const val = localRow[key];
            if (Array.isArray(val)) {
                localResult[key] = "Array";
            } else if (typeof val === "object") {
                localResult[key] = "Object";
            } else if (typeof val === "string") {
                localResult[key] = val;
            } else {
                localResult[key] = String(val);
            }
        }
    }

    return localResult;
}

/**
 * Main process:
 * 1. Reads data.json and want.json.
 * 2. Identifies all master keys to guarantee homogeneous schema across all vouchers.
 * 3. Normalizes every row to this uniform structure.
 * 4. Writes struct_3.json.
 */
export function generateStruct3File({ inInputFilePath, inWantFilePath, inOutputFilePath }) {
    const localInputFilePath = inInputFilePath;
    const localWantFilePath = inWantFilePath;
    const localOutputFilePath = inOutputFilePath;

    console.log(`[1/4] Loading base keys from: ${localWantFilePath}`);
    const localWantedKeysList = loadWantedKeys({ inWantFilePath: localWantFilePath });
    console.log(`- Loaded ${localWantedKeysList.length} base keys from want.json`);

    console.log(`[2/4] Reading UTF-16 LE file: ${localInputFilePath}`);
    console.time("Read & Parse");
    const localRawData = readUtf16LeJson({ inFilePath: localInputFilePath });
    console.timeEnd("Read & Parse");

    const localVouchers = localRawData.tallymessage || [];
    console.log(`- Total vouchers found: ${localVouchers.length}`);

    console.log(`[3/4] Discovering all unique Array & Object keys across all rows...`);
    console.time("Collect Master Keys");
    const localMasterKeys = collectMasterKeys({
        inVouchers: localVouchers,
        inWantedKeysList: localWantedKeysList
    });
    console.timeEnd("Collect Master Keys");
    console.log(`- Total uniform keys per row: ${localMasterKeys.length}`);
    console.log(`- Keys: ${localMasterKeys.join(", ")}`);

    console.log(`[4/4] Normalizing all rows to homogeneous structure...`);
    console.time("Format Rows");
    const localRowsArray = localVouchers.map((row) =>
        formatRowStruct3({ inRow: row, inMasterKeysList: localMasterKeys })
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
    console.log(`- Total rows in struct_3.json: ${localRowsArray.length}`);
    console.log(`- Keys in every row:           ${localMasterKeys.length} (100% homogeneous)`);
    console.log(`- struct_3.json file size:     ${localOutputSizeMb} MB`);

    return localRowsArray;
}

// Auto-run when executed directly
const DEFAULT_INPUT = path.join(__dirname, "data.json");
const DEFAULT_WANT = path.join(__dirname, "want.json");
const DEFAULT_OUTPUT = path.join(__dirname, "struct_3.json");

generateStruct3File({
    inInputFilePath: DEFAULT_INPUT,
    inWantFilePath: DEFAULT_WANT,
    inOutputFilePath: DEFAULT_OUTPUT
});
