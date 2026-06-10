import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

// Prepares single inventory entry
const startFunc = ({ inItemName, inTaxPer, inUom, inRate, inQty }) => {

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const filePath = path.join(__dirname, "../../Import/Templates/inventory.json");

    let template = fs.readFileSync(filePath, "utf8");

    let data = JSON.parse(template);

    const LocalItemName = inItemName;
    const LocalUom = inUom;
    const LocalQty = inQty;
    const LocalRate = inRate;

    const LocalRateWithTax = LocalRate * (1 + (inTaxPer / 100));
    const LocalAmount = LocalRate * LocalQty;

    data.hsnitemsource = LocalItemName;
    data.gstitemsource = LocalItemName;
    data.stockitemname = LocalItemName;

    data.mrprate = `${LocalRateWithTax}.00/${LocalUom}`;
    data.inclvatrate = `${LocalRateWithTax}.00/${LocalUom}`;


    // --------------------------------------------------
    // Quantity & Amount
    // --------------------------------------------------

    data.amount = `${LocalAmount}.00`;
    data.rate = `${LocalRate}.00/${LocalUom}`;
    data.actualqty = `${LocalQty}.00 ${LocalUom}`;
    data.billedqty = `${LocalQty}.00 ${LocalUom}`;


    // --------------------------------------------------
    // Batch Allocation
    // --------------------------------------------------

    data.batchallocations[0].amount = LocalRate * LocalQty;
    data.batchallocations[0].actualqty = `${LocalQty}.00 ${LocalUom}`;
    data.batchallocations[0].billedqty = `${LocalQty}.00 ${LocalUom}`;


    // --------------------------------------------------
    // Accounting Allocation
    // --------------------------------------------------

    data.accountingallocations[0].classrate = `${LocalRate}.00`;
    data.accountingallocations[0].amount = `${LocalAmount}.00`;

    updateRateDetails(data.ratedetails, inTaxPer);

    return data;
};

// Update GST ratedetails safely
const updateRateDetails = (ratedetails, taxPer) => {
    const half = (taxPer / 2).toFixed(2);
    const full = Number(taxPer).toFixed(2);

    ratedetails.forEach(row => {
        switch (row.gstratedutyhead) {
            case "CGST":
                row.gstrate = half;
                break;
            case "SGST/UTGST":
                row.gstrate = half;
                break;
            case "IGST":
                row.gstrate = full;
                break;
        }
    });
};

export { startFunc };