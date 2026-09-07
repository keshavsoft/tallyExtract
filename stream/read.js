import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chain } from "stream-chain";
import { parser } from "stream-json";
import { pick } from "stream-json/filters/Pick.js";
import { streamArray } from "stream-json/streamers/stream-array.js";

// ==========================================
// FILE PATH SETUP
// ==========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(
    __dirname,
    "Transactions-utf8.json"
);
    // "Transactions.json"



const OUTPUT_FOLDER = path.join(
    __dirname,
    "output"
);

const CHUNK_SIZE = 10000;


// ==========================================
// CREATE OUTPUT FOLDER
// ==========================================

if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER);
}


// ==========================================
// OUTPUT VARIABLES
// ==========================================

let chunk = [];
let fileNumber = 1;
let totalTransactions = 0;


// ==========================================
// GENERIC FUNCTION
// KEEP ONLY SELECTED FIELDS
// ==========================================

function pickFields(source, fields) {

    const result = {};

    if (!source) {
        return result;
    }

    for (const field of fields) {

        if (source[field] !== undefined) {

            result[field] = source[field];

        }

    }

    return result;
}


// ==========================================
// LEVEL 1
// FILTER TRANSACTION
// ==========================================

function filterTransaction(transaction) {

    const result = pickFields(
        transaction,
        [
            "date",
            "guid",
            "vouchertypename"
        ]
    );


    // --------------------------------------
    // INVENTORY ENTRIES
    // --------------------------------------

    if (transaction.allinventoryentries) {

        result.allinventoryentries =
            transaction.allinventoryentries.map(
                filterInventoryEntry
            );

    }


    // --------------------------------------
    // LEDGER ENTRIES
    // --------------------------------------

    if (transaction.ledgerentries) {

        result.ledgerentries =
            transaction.ledgerentries.map(
                filterLedgerEntry
            );

    }


    return result;
}


// ==========================================
// LEVEL 2
// FILTER INVENTORY ENTRY
// ==========================================

function filterInventoryEntry(item) {

    const result = pickFields(
        item,
        [
            "stockitemname",
            "rate",
            "amount"
        ]
    );


    // --------------------------------------
    // BATCH ALLOCATIONS
    // --------------------------------------

    if (item.batchallocations) {

        result.batchallocations =
            item.batchallocations.map(
                filterBatchAllocation
            );

    }


    return result;
}


// ==========================================
// LEVEL 3
// FILTER BATCH ALLOCATION
// ==========================================

function filterBatchAllocation(batch) {

    return pickFields(
        batch,
        [
            "godownname",
            "batchname",
            "amount"
        ]
    );

}


// ==========================================
// LEVEL 2
// FILTER LEDGER ENTRY
// ==========================================

function filterLedgerEntry(ledger) {

    return pickFields(
        ledger,
        [
            "ledgername",
            "amount",
            "isdeemedpositive"
        ]
    );

}


// ==========================================
// WRITE OUTPUT CHUNK
// ==========================================

function writeChunk() {

    if (chunk.length === 0) {
        return;
    }


    const fileName = path.join(
        OUTPUT_FOLDER,
        `reduced-transactions-${fileNumber}.json`
    );


    // Preserve the original tallymessage structure

    const outputData = {
        tallymessage: chunk
    };


    fs.writeFileSync(
        fileName,
        JSON.stringify(
            outputData,
            null,
            2
        )
    );


    console.log(
        `Created: ${fileName}`
    );

    console.log(
        `Transactions: ${chunk.length}`
    );


    fileNumber++;

    chunk = [];
}


// ==========================================
// ADD TRANSACTION
// ==========================================

function addTransaction(transaction) {

    const filteredTransaction =
        filterTransaction(transaction);


    chunk.push(
        filteredTransaction
    );


    totalTransactions++;


    if (chunk.length >= CHUNK_SIZE) {

        writeChunk();

    }

}


// ==========================================
// STREAM INPUT FILE
// ==========================================

const pipeline = chain([

    fs.createReadStream(
        INPUT_FILE
    ),

    parser(),

    pick({
        filter: "tallymessage"
    }),

    streamArray()

]);


// ==========================================
// PROCESS EACH TRANSACTION
// ==========================================

pipeline.on(
    "data",

    ({ value: transaction }) => {

        if (!transaction) {
            return;
        }


        addTransaction(
            transaction
        );

    }

);


// ==========================================
// FINISH
// ==========================================

pipeline.on(
    "end",

    () => {

        // Write the remaining transactions

        writeChunk();


        console.log(
            "\nFinished successfully."
        );


        console.log(
            `Total transactions: ${totalTransactions}`
        );


        console.log(
            `Total files created: ${fileNumber - 1}`
        );

    }

);


// ==========================================
// ERROR HANDLING
// ==========================================

pipeline.on(
    "error",

    error => {

        console.error(
            "\nError:"
        );

        console.error(
            error
        );

    }

);