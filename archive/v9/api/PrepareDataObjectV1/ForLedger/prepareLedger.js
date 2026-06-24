import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

import ledgersJson from "../../Import/Templates/ledgers.json" with {type: "json"};

// Prepares single ledger entry
const startFunc = ({ inLedgerName, inAmount }) => {

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // const filePath = path.join(__dirname, "../../Import/Templates/ledgers.json");

    // let template = fs.readFileSync(filePath, "utf8");

    // let data = JSON.parse(template);

    let data = structuredClone(ledgersJson);

    data.ledgername = inLedgerName;
    data.amount = inAmount;
    data.isdeemedpositive = true;

    return data;
};

export { startFunc };