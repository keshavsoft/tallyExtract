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
 * Loads the desired keys from want.json.
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

    return new Set(localKeysArray);
}

/**
 * Formats a single voucher row according to Version 2 rules:
 * 1. If value is an Array -> value is set to "Array" (never pull full nested data)
 * 2. If value is an Object -> value is set to "Object" (never pull full nested data)
 * 3. If value is a String:
 *    - Included only if key is listed in want.json -> exact string value is pulled
 *    - Omitted if key is NOT in want.json
 * 4. All other primitives (booleans, numbers, etc.) are omitted.
 */
export function formatRowStruct2({ inRow, inWantedKeys }) {
    const localRow = inRow;

    if (!localRow || typeof localRow !== "object") {
        return localRow;
    }

    const localResult = {};

    for (const [key, val] of Object.entries(localRow)) {
        const isArray = Array.isArray(val);
        const isObject = !isArray && typeof val === "object" && val !== null;
        const isString = typeof val === "string";

        if (isArray) {
            // Arrays (whether in want.json or newly discovered) are named "Array"
            localResult[key] = "Array";
        } else if (isObject) {
            // Objects (whether in want.json or newly discovered) are named "Object"
            localResult[key] = "Object";
        } else if (isString && inWantedKeys.has(key)) {
            // Strings: pulled only if listed in want.json
            localResult[key] = val;
        }
        // Booleans, numbers, and strings not in want.json are omitted
    }

    return localResult;
}

/**
 * Reads every row from tallymessage in data.json, formats each row,
 * and writes the array of rows to struct_2.json.
 */
export function generateStruct2File({ inInputFilePath, inWantFilePath, inOutputFilePath }) {
    const localInputFilePath = inInputFilePath;
    const localWantFilePath = inWantFilePath;
    const localOutputFilePath = inOutputFilePath;

    console.log(`[1/4] Loading wanted keys from: ${localWantFilePath}`);
    const localWantedKeys = loadWantedKeys({ inWantFilePath: localWantFilePath });
    console.log(`- Loaded ${localWantedKeys.size} wanted keys from want.json`);

    console.log(`[2/4] Reading UTF-16 LE file: ${localInputFilePath}`);
    console.time("Read & Parse");
    const localRawData = readUtf16LeJson({ inFilePath: localInputFilePath });
    console.timeEnd("Read & Parse");

    const localVouchers = localRawData.tallymessage || [];
    console.log(`[3/4] Processing every row (${localVouchers.length} rows)...`);

    console.time("Format Rows");
    const localRowsArray = localVouchers.map((row) =>
        formatRowStruct2({ inRow: row, inWantedKeys: localWantedKeys })
    );
    console.timeEnd("Format Rows");

    console.log(`[4/4] Writing output to: ${localOutputFilePath}`);
    console.time("Write File");
    fs.writeFileSync(
        localOutputFilePath,
        JSON.stringify(localRowsArray, null, 2),
        "utf8"
    );
    console.timeEnd("Write File");

    const localOutputSizeMb = (fs.statSync(localOutputFilePath).size / (1024 * 1024)).toFixed(2);
    console.log(`Done!`);
    console.log(`- Total rows in struct_2.json: ${localRowsArray.length}`);
    console.log(`- struct_2.json file size:     ${localOutputSizeMb} MB`);

    return localRowsArray;
}

// Auto-run when executed directly
const DEFAULT_INPUT = path.join(__dirname, "data.json");
const DEFAULT_WANT = path.join(__dirname, "want.json");
const DEFAULT_OUTPUT = path.join(__dirname, "struct_2.json");

generateStruct2File({
    inInputFilePath: DEFAULT_INPUT,
    inWantFilePath: DEFAULT_WANT,
    inOutputFilePath: DEFAULT_OUTPUT
});
