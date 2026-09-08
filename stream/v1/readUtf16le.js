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
 * Recursively samples data structures to keep at most `inLimit` items/keys at every level:
 * - For Arrays: keeps top `inLimit` elements and recursively samples each element.
 * - For Objects: keeps top `inLimit` scalar keys and recursively samples all nested objects/arrays.
 * - For Primitives: returns as-is.
 */
export function sampleNode({ inData, inLimit = 4 }) {
    const localData = inData;
    const localLimit = inLimit;

    if (Array.isArray(localData)) {
        return localData
            .slice(0, localLimit)
            .map((item) => sampleNode({ inData: item, inLimit: localLimit }));
    }

    if (typeof localData === "object" && localData !== null) {
        const localResult = {};
        const localEntries = Object.entries(localData);

        const localScalars = localEntries.filter(
            ([k, v]) => typeof v !== "object" || v === null
        );
        const localComplex = localEntries.filter(
            ([k, v]) => typeof v === "object" && v !== null
        );

        // Keep top N scalar fields (e.g. date, guid, narration, vouchertypename)
        for (const [k, v] of localScalars.slice(0, localLimit)) {
            localResult[k] = v;
        }

        // Recursively process nested objects/arrays (e.g. metadata, oldauditentryids, allledgerentries, billallocations)
        for (const [k, v] of localComplex) {
            localResult[k] = sampleNode({ inData: v, inLimit: localLimit });
        }

        return localResult;
    }

    return localData;
}

/**
 * Processes the full tallymessage array and writes the sampled output.
 */
export function processTallyFile({ inInputFilePath, inOutputFilePath, inLimit = 4 }) {
    const localInputFilePath = inInputFilePath;
    const localOutputFilePath = inOutputFilePath;
    const localLimit = inLimit;

    console.log(`[1/3] Reading UTF-16 LE file: ${localInputFilePath}`);
    console.time("Read & Parse");
    const localRawData = readUtf16LeJson({ inFilePath: localInputFilePath });
    console.timeEnd("Read & Parse");

    const localVouchers = localRawData.tallymessage || [];
    console.log(`[2/3] Processing ${localVouchers.length} vouchers through whole tallymessage...`);

    console.time("Transform");
    const localSampledMessages = localVouchers.map((voucher) =>
        sampleNode({ inData: voucher, inLimit: localLimit })
    );
    console.timeEnd("Transform");

    const localOutputData = {
        tallymessage: localSampledMessages
    };

    console.log(`[3/3] Writing sampled JSON to: ${localOutputFilePath}`);
    fs.writeFileSync(
        localOutputFilePath,
        JSON.stringify(localOutputData, null, 2),
        "utf8"
    );

    const localInputSizeMb = (fs.statSync(localInputFilePath).size / (1024 * 1024)).toFixed(2);
    const localOutputSizeMb = (fs.statSync(localOutputFilePath).size / (1024 * 1024)).toFixed(2);

    console.log(`Done!`);
    console.log(`- Original file size: ${localInputSizeMb} MB`);
    console.log(`- Sampled file size:  ${localOutputSizeMb} MB`);
    console.log(`- Total vouchers:     ${localSampledMessages.length}`);

    return localOutputData;
}

// Auto-run when executed directly
const DEFAULT_INPUT = path.join(__dirname, "data.json");
const DEFAULT_OUTPUT = path.join(__dirname, "reduced-data.json");

processTallyFile({
    inInputFilePath: DEFAULT_INPUT,
    inOutputFilePath: DEFAULT_OUTPUT,
    inLimit: 4
});
