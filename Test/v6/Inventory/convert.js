import fs from "fs";

const rawData = JSON.parse(fs.readFileSync("./purchases_original.json", "utf-8"));


function flattenInventoryBatchAllocations({ inData }) {
    // 1. Assign input parameter to local variable
    const localData = inData;

    if (!Array.isArray(localData)) return [];

    // 2. Flatten down through vouchers -> allinventoryentries -> batchallocations
    const flatArray = localData.flatMap(inVoucher => {
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

    const convertedArray = flatArray.map(element => {
        const rawQty = element["allinventoryentries.batchallocations.actualqty"] || "";
        const [qtyStr, ...uomParts] = rawQty.trim().split(/\s+/);
        const qty = parseFloat(qtyStr) || 0;
        const uom = uomParts.join(" ");
        const outwardVouchers = ["Sales/Cr Mani", "Sales/CA", "Sales", "Sales/E", "Sales/slip"];
        const inwardVouchers = ["Purchase"];
        let inwardQty = 0;
        let outwardQty = 0;

        if (inwardVouchers.includes(element.vchtype.trim())) {
            inwardQty = qty;
        };

        if (outwardVouchers.includes(element.vchtype.trim())) {
            outwardQty = qty;
        };
        console.log("sssss : ", inwardQty, outwardQty, qtyStr, qty, element.vchtype);

        return {
            "vchtype": element.vchtype,
            "date": element.date,
            "vouchernumber": element.vouchernumber,
            "stockitemname": element["allinventoryentries.stockitemname"],
            "qty": qty,
            "uom": uom,
            "godownname": element["allinventoryentries.batchallocations.godownname"],
            "batchname": element["allinventoryentries.batchallocations.batchname"],
            "inwardQty": inwardQty,
            "outwardQty": outwardQty
        }
    });

    return convertedArray;
};

const flattenedList = flattenInventoryBatchAllocations({ inData: rawData });

fs.writeFileSync("flat.json", JSON.stringify(flattenedList));


