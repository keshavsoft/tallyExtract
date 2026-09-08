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
 * Keeps all fields of a single voucher row intact, trimming only subtrees:
 * - Nested Array -> 'Array'
 * - Nested Object -> 'Object'
 * - Primitive value -> exact value intact
 */
export function formatRowStruct({ inRow }) {
    const localRow = inRow;

    if (!localRow || typeof localRow !== "object") {
        return localRow;
    }

    const localResult = {};

    for (const [key, val] of Object.entries(localRow)) {
        if (Array.isArray(val)) {
            localResult[key] = "Array";
        } else if (typeof val === "object" && val !== null) {
            localResult[key] = "Object";
        } else {
            localResult[key] = val;
        }
    }

    return localResult;
}

/**
 * Reads every row from tallymessage in data.json, formats each row,
 * and writes the complete array of rows directly to struct.json.
 */
export function generateStructFile({ inInputFilePath, inOutputFilePath }) {
    const localInputFilePath = inInputFilePath;
    const localOutputFilePath = inOutputFilePath;

    console.log(`[1/3] Reading UTF-16 LE file: ${localInputFilePath}`);
    console.time("Read & Parse");
    const localRawData = readUtf16LeJson({ inFilePath: localInputFilePath });
    console.timeEnd("Read & Parse");

    const localVouchers = localRawData.tallymessage || [];
    console.log(`[2/3] Processing every row (${localVouchers.length} rows)...`);

    console.time("Format Rows");
    const localRowsArray = localVouchers.map((row) =>
        formatRowStruct({ inRow: row })
    );
    console.timeEnd("Format Rows");

    console.log(`[3/3] Writing complete array to: ${localOutputFilePath}`);
    fs.writeFileSync(
        localOutputFilePath,
        JSON.stringify(localRowsArray, null, 2),
        "utf8"
    );

    const localOutputSizeMb = (fs.statSync(localOutputFilePath).size / (1024 * 1024)).toFixed(2);
    console.log(`Done!`);
    console.log(`- Total rows in struct.json: ${localRowsArray.length}`);
    console.log(`- struct.json file size:     ${localOutputSizeMb} MB`);

    return localRowsArray;
}

// Auto-run when executed directly
const DEFAULT_INPUT = path.join(__dirname, "data.json");
const DEFAULT_OUTPUT = path.join(__dirname, "struct.json");

generateStructFile({
    inInputFilePath: DEFAULT_INPUT,
    inOutputFilePath: DEFAULT_OUTPUT
});
