import { getInventoryItems } from "./getInventoryItems.js";
import { buildBatchRow } from "./buildBatchRow.js";
const inventoryKey = "ALLINVENTORYENTRIES.LIST";
const batchKey = "BATCHALLOCATIONS.LIST";

const startFunc = ({ inVouchersArray = [] } = {}) => {

    const result = [];

    inVouchersArray.forEach(VOUCHER => {

        const inventoryItems = getInventoryItems({
            inVoucherRow: VOUCHER,
            inInventoryKey: inventoryKey
        });

        inventoryItems.forEach(item => {

            const rows =
                buildBatchRow({
                    VOUCHER,
                    item,
                    inBatchKey: batchKey
                });

            result.push(...rows);
        });
    });

    return result;
};

export default startFunc;