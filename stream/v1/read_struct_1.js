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
 * Loads the desired string keys from want.json.
 */
export function loadWantedKeys({ inWantFilePath }) {
    const localWantFilePath = inWantFilePath;

    if (!fs.existsSync(localWantFilePath)) {
        throw new Error(`Want file not found: ${localWantFilePath}`);
    }

    const localContent = fs.readFileSync(localWantFilePath, "utf8");
    const localParsed = JSON.parse(localContent);

    // Supports both object keys or an array of key strings
    const localKeysArray = Array.isArray(localParsed)
        ? localParsed
        : Object.keys(localParsed);

    return new Set(localKeysArray);
}

/**
 * Formats a single row:
 * - If value is array or object -> directly pulls them intact (all nested data preserved)
 * - If value is a string -> pulls only if the key is in wantedKeys
 * - All other primitives (like booleans) are excluded
 */
export function formatRowStruct1({ inRow, inWantedKeys }) {
    const localRow = inRow;

    if (!localRow || typeof localRow !== "object") {
        return localRow;
    }

    const localResult = {};

    for (const [key, val] of Object.entries(localRow)) {
        if (Array.isArray(val) || (typeof val === "object" && val !== null)) {
            // Directly pull array or object
            localResult[key] = val;
        } else if (typeof val === "string" && inWantedKeys.has(key)) {
            // Put only these keys when value is a string
            localResult[key] = val;
        }
    }

    return localResult;
}

/**
 * Reads every row from tallymessage in data.json, formats each row,
 * and writes the complete array of rows directly to struct_1.json.
 */
export function generateStruct1File({ inInputFilePath, inWantFilePath, inOutputFilePath }) {
    const localInputFilePath = inInputFilePath;
    const localWantFilePath = inWantFilePath;
    const localOutputFilePath = inOutputFilePath;

    console.log(`[1/4] Loading wanted keys from: ${localWantFilePath}`);
    const localWantedKeys = loadWantedKeys({ inWantFilePath: localWantFilePath });
    console.log(`- Wanted string keys count: ${localWantedKeys.size}`);

    console.log(`[2/4] Reading UTF-16 LE file: ${localInputFilePath}`);
    console.time("Read & Parse");
    const localRawData = readUtf16LeJson({ inFilePath: localInputFilePath });
    console.timeEnd("Read & Parse");

    const localVouchers = localRawData.tallymessage || [];
    console.log(`[3/4] Processing every row (${localVouchers.length} rows)...`);

    console.time("Format Rows");
    const localRowsArray = localVouchers.map((row) =>
        formatRowStruct1({ inRow: row, inWantedKeys: localWantedKeys })
    );
    console.timeEnd("Format Rows");

    console.log(`[4/4] Writing complete array to: ${localOutputFilePath}`);
    console.time("Write File");
    fs.writeFileSync(
        localOutputFilePath,
        JSON.stringify(localRowsArray, null, 2),
        "utf8"
    );
    console.timeEnd("Write File");

    const localOutputSizeMb = (fs.statSync(localOutputFilePath).size / (1024 * 1024)).toFixed(2);
    console.log(`Done!`);
    console.log(`- Total rows in struct_1.json: ${localRowsArray.length}`);
    console.log(`- struct_1.json file size:     ${localOutputSizeMb} MB`);

    return localRowsArray;
}

// Auto-run when executed directly
const DEFAULT_INPUT = path.join(__dirname, "data.json");
const DEFAULT_WANT = path.join(__dirname, "want.json");
const DEFAULT_OUTPUT = path.join(__dirname, "struct_1.json");

generateStruct1File({
    inInputFilePath: DEFAULT_INPUT,
    inWantFilePath: DEFAULT_WANT,
    inOutputFilePath: DEFAULT_OUTPUT
});
