import { getInventoryItems } from "./getInventoryItems.js";
import { buildBatchRow } from "./buildBatchRow.js";

const startFunc = (VOUCHERS) => {

    const result = [];

    VOUCHERS.forEach(VOUCHER => {

        const inventoryItems =
            getInventoryItems(VOUCHER);

        inventoryItems.forEach(item => {

            const rows =
                buildBatchRow({
                    VOUCHER,
                    item
                });

            result.push(...rows);
        });
    });

    return result;
};

export default startFunc;