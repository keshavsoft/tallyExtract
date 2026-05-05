import path from "path";
import { fileURLToPath } from "url";
import { startFunc as prepareLedger } from "./prepareLedger.js";

// Creates ledger entries for voucher
const startFunc = ({ inItemsJsonAsArray, inLedgerDetails }) => {
    let LocalArray = [];

    const LocalInItemsJsonAsArray = inItemsJsonAsArray;

    const LocalAmount = LocalInItemsJsonAsArray.map(element => {
        return element.Rate * element.Qty * (1 + (element.TaxPer / 100));
    });

    const LocalOnlyAmount = LocalInItemsJsonAsArray.map(element => {
        return element.Rate * element.Qty;
    });

    const amountSum = LocalAmount.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const onlyAmountSum = LocalOnlyAmount.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    const LocalLedgerEntry = prepareLedger({
        inLedgerName: inLedgerDetails.LedgerName,
        inAmount: `-${amountSum}.00`
    });

    LocalArray.push(LocalLedgerEntry);

    const LocalCGST = prepareLedger({
        inLedgerName: "CGST Output",
        inAmount: `${(amountSum - onlyAmountSum) / 2}.00`
    });

    LocalArray.push(LocalCGST);

    const LocalSGST = prepareLedger({
        inLedgerName: "SGST Output",
        inAmount: `${(amountSum - onlyAmountSum) / 2}.00`
    });

    LocalArray.push(LocalSGST);

    return LocalArray;
};

export { startFunc };