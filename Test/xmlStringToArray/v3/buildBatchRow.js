import { getBatches } from "./getBatches.js";

const buildBatchRow = ({
    VOUCHER,
    item, inBatchKey
}) => {

    const batches =
        getBatches({ item, inBatchKey });

    return batches.map(batch => ({
        DATE: VOUCHER.DATE["#text"],
        VOUCHERNUMBER: VOUCHER.VOUCHERNUMBER,
        VOUCHERTYPENAME: VOUCHER.VOUCHERTYPENAME,

        STOCKITEMNAME: item.STOCKITEMNAME,
        RATE: item.RATE,
        AMOUNT: item.AMOUNT,
        ACTUALQTY: item.ACTUALQTY,
        BILLEDQTY: item.BILLEDQTY,

        GODOWNNAME: batch.GODOWNNAME,
        BATCHNAME: batch.BATCHNAME,
        BATCHAMOUNT: batch.AMOUNT,
        BATCHACTUALQTY: batch.ACTUALQTY,
        BATCHBILLEDQTY: batch.BILLEDQTY
    }));
};

export { buildBatchRow };