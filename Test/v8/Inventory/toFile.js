import fs from "fs";
import { inventoryV4 } from "../../../index.js";

const jsonFileName = "purchases.json";

function flattenInventoryBatchAllocations({ inData }) {
    // 1. Assign input parameter to local variable
    const localData = inData;

    if (!Array.isArray(localData)) return [];

    // 2. Flatten down through vouchers -> allinventoryentries -> batchallocations
    return localData.flatMap(inVoucher => {
        const localVoucher = inVoucher;
        const { allinventoryentries, ...localVoucherDetails } = localVoucher;

        if (!Array.isArray(allinventoryentries)) return [];

        return allinventoryentries.flatMap(inEntry => {
            const localEntry = inEntry;
            const { batchallocations, ...localEntryDetails } = localEntry;

            const localEntryPrefixed = Object.fromEntries(
                Object.entries(localEntryDetails).map(([key, value]) => [`allinventoryentries.${key}`, value])
            );

            if (!Array.isArray(batchallocations)) return [];

            return batchallocations.map(inBatch => {
                const localBatch = inBatch;

                const localBatchPrefixed = Object.fromEntries(
                    Object.entries(localBatch).map(([key, value]) => [`allinventoryentries.batchallocations.${key}`, value])
                );

                // Merge properties from each step with step keys
                return {
                    ...localVoucherDetails,
                    ...localEntryPrefixed,
                    ...localBatchPrefixed
                };
            });
        });
    });
};

inventoryV4({ inSvCurrentCompany: "me" }).then(promiseData => {
    const flatArray = flattenInventoryBatchAllocations({ inData: promiseData });

    fs.writeFileSync(jsonFileName, JSON.stringify(flatArray));
});