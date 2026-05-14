import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

// Prepares single ledger entry
const startFunc = ({ inLedgerName, inAmount }) => {

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filePath = path.join(__dirname, "../../Import/Templates/ledgers.json");

    let template = fs.readFileSync(filePath, "utf8");

    let data = JSON.parse(template);

    data.ledgername = inLedgerName;
    data.amount = inAmount;

    return data;
};

export { startFunc };