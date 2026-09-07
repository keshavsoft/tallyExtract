import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chain } from "stream-chain";
import { pick } from "stream-json/filters/Pick.js";

import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/stream-array.js";
// ================================
// CONFIGURATION
// ================================
const INPUT_FILE1 = "./Transactions.json";
const INPUT_FILE = "./Transactions-utf8.json";
// Output folder
const OUTPUT_FOLDER = "./output";

// Number of inventory rows per output file
const CHUNK_SIZE = 10000;


// ================================
// CREATE OUTPUT FOLDER
// ================================

if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER);
}


// ================================
// OUTPUT VARIABLES
// ================================

let chunk = [];
let fileNumber = 1;
let totalRows = 0;


// ================================
// WRITE CHUNK
// ================================

function writeChunk() {

    if (chunk.length === 0) {
        return;
    }

    const fileName = path.join(
        OUTPUT_FOLDER,
        `inventory-${fileNumber}.json`
    );

    fs.writeFileSync(
        fileName,
        JSON.stringify(chunk)
    );

    console.log(
        `Created: ${fileName} | Rows: ${chunk.length}`
    );

    fileNumber++;

    chunk = [];
}


// ================================
// ADD ROW
// ================================

function addRow(row) {

    chunk.push(row);

    totalRows++;

    if (chunk.length >= CHUNK_SIZE) {
        writeChunk();
    }
}


// ================================
// STREAM THE LARGE JSON FILE
// ================================
const pipeline = chain([
    fs.createReadStream(INPUT_FILE),

    parser(),

    pick({
        filter: "tallymessage"
    }),

    streamArray()
]);

pipeline.on("data", ({ value: transaction }) => {

    // Safety check
    if (!transaction) {
        return;
    }


    // ==========================================
    // GET INVENTORY ENTRIES
    // ==========================================

    const inventoryEntries =
        transaction.allinventoryentries || [];


    // ==========================================
    // CREATE ONE OUTPUT ROW FOR EACH ITEM
    // ==========================================

    for (const item of inventoryEntries) {

        const outputRow = {

            // ------------------------------
            // TRANSACTION INFORMATION
            // ------------------------------

            date: transaction.date,

            guid: transaction.guid,

            remoteid:
                transaction.metadata?.remoteid,

            voucherType:
                transaction.vouchertypename,

            voucherNumber:
                transaction.vouchernumber,

            reference:
                transaction.reference,

            partyName:
                transaction.partyname,

            state:
                transaction.statename,

            placeOfSupply:
                transaction.placeofsupply,


            // ------------------------------
            // INVENTORY INFORMATION
            // ------------------------------

            stockItemName:
                item.stockitemname,

            rate:
                item.rate,

            amount:
                item.amount,

            actualQty:
                item.actualqty,

            billedQty:
                item.billedqty,


            // ------------------------------
            // OPTIONAL BATCH INFORMATION
            // ------------------------------

            batches: (item.batchallocations || []).map(batch => ({
                godownName:
                    batch.godownname,

                batchName:
                    batch.batchname,

                amount:
                    batch.amount,

                actualQty:
                    batch.actualqty,

                billedQty:
                    batch.billedqty
            }))
        };


        addRow(outputRow);
    }

});


// ================================
// FINISH
// ================================

pipeline.on("end", () => {

    // Write the remaining rows
    writeChunk();

    console.log("\nFinished successfully.");

    console.log(
        `Total inventory rows: ${totalRows}`
    );

    console.log(
        `Total files created: ${fileNumber - 1}`
    );

});


pipeline.on("error", error => {

    console.error("Error:");

    console.error(error);

});