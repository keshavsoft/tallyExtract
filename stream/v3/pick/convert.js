import fs from "fs";

const rawData = JSON.parse(fs.readFileSync("./pick.json", "utf-8"));

const forAllinventoryentries = ({ inAllinventoryentries, inLocalVoucherDetails }) => {
    const localAllinventoryentries = inAllinventoryentries;
    const localLocalVoucherDetails = inLocalVoucherDetails;

    const inventoryKey = "allinventoryentries";

    if (!Array.isArray(localAllinventoryentries)) return [];

    return localAllinventoryentries.flatMap(inEntry => {
        const localEntry = inEntry;
        const { batchallocations, ...localEntryDetails } = localEntry;

        const localEntryPrefixed = Object.fromEntries(
            Object.entries(localEntryDetails).map(([key, value]) => [`${inventoryKey}.${key}`, value])
        );

        if (!Array.isArray(batchallocations)) return [];

        return batchallocations.map(inBatch => {
            const localBatch = inBatch;

            const localBatchPrefixed = Object.fromEntries(
                Object.entries(localBatch).map(([key, value]) => [`${inventoryKey}.batchallocations.${key}`, value])
            );

            // Merge properties from each step with step keys
            return {
                ...localLocalVoucherDetails,
                ...localEntryPrefixed,
                ...localBatchPrefixed
            };
        });
    });
};

const forInventoryentriesin = ({ inInventoryentriesin, inLocalVoucherDetails }) => {
    const localInventoryentriesin = inInventoryentriesin;
    const localLocalVoucherDetails = inLocalVoucherDetails;

    const inventoryKey = "inventoryentriesin";

    if (!Array.isArray(localInventoryentriesin)) return [];

    return localInventoryentriesin.flatMap(inEntry => {
        const localEntry = inEntry;
        const { batchallocations, ...localEntryDetails } = localEntry;

        const localEntryPrefixed = Object.fromEntries(
            Object.entries(localEntryDetails).map(([key, value]) => [`${inventoryKey}.${key}`, value])
        );

        if (!Array.isArray(batchallocations)) return [];

        return batchallocations.map(inBatch => {
            const localBatch = inBatch;

            const localBatchPrefixed = Object.fromEntries(
                Object.entries(localBatch).map(([key, value]) => [`${inventoryKey}.batchallocations.${key}`, value])
            );

            // console.log("inBatch : ", localLocalVoucherDetails, localEntryPrefixed, localBatchPrefixed);
            // Merge properties from each step with step keys
            return {
                ...localLocalVoucherDetails,
                ...localEntryPrefixed,
                ...localBatchPrefixed
            };
        });
    });
};

const forInventoryentriesout = ({ inInventoryentriesout, inLocalVoucherDetails }) => {
    const localInventoryentriesout = inInventoryentriesout;
    const localLocalVoucherDetails = inLocalVoucherDetails;

    const inventoryKey = "inventoryentriesout";

    if (!Array.isArray(localInventoryentriesout)) return [];

    return localInventoryentriesout.flatMap(inEntry => {
        const localEntry = inEntry;
        const { batchallocations, ...localEntryDetails } = localEntry;

        const localEntryPrefixed = Object.fromEntries(
            Object.entries(localEntryDetails).map(([key, value]) => [`${inventoryKey}.${key}`, value])
        );

        if (!Array.isArray(batchallocations)) return [];

        return batchallocations.map(inBatch => {
            const localBatch = inBatch;

            const localBatchPrefixed = Object.fromEntries(
                Object.entries(localBatch).map(([key, value]) => [`${inventoryKey}.batchallocations.${key}`, value])
            );

            // Merge properties from each step with step keys
            return {
                ...localLocalVoucherDetails,
                ...localEntryPrefixed,
                ...localBatchPrefixed
            };
        });
    });
};

function flattenInventoryBatchAllocations({ inData }) {
    // 1. Assign input parameter to local variable
    const localData = inData;

    if (!Array.isArray(localData)) return [];

    // 2. Flatten down through vouchers -> allinventoryentries -> batchallocations
    const flatArray = localData.flatMap(inVoucher => {
        const localVoucher = inVoucher;
        const { allinventoryentries, inventoryentriesin, inventoryentriesout, ...localVoucherDetails } = localVoucher;

        return [
            ...forAllinventoryentries({ inAllinventoryentries: allinventoryentries, inLocalVoucherDetails: localVoucherDetails }),
            ...forInventoryentriesin({ inInventoryentriesin: inventoryentriesin, inLocalVoucherDetails: localVoucherDetails }),
            ...forInventoryentriesout({ inInventoryentriesout: inventoryentriesout, inLocalVoucherDetails: localVoucherDetails }),
        ];
    });

    const convertedArray = flatArray.map(element => {
        const rawQty = element["allinventoryentries.batchallocations.actualqty"] || "";
        const [qtyStr, ...uomParts] = rawQty.trim().split(/\s+/);
        const qty = parseFloat(qtyStr) || 0;

        const rawInQty = element["inventoryentriesin.batchallocations.actualqty"] || "";
        const [qtyInStr, ...uomInParts] = rawInQty.trim().split(/\s+/);
        const qtyIn = parseFloat(qtyInStr) || 0;

        const rawOutQty = element["inventoryentriesout.batchallocations.actualqty"] || "";
        const [qtyOutStr, ...uomOutParts] = rawOutQty.trim().split(/\s+/);
        const qtyOut = parseFloat(qtyOutStr) || 0;

        const uom = uomParts.join(" ");
        const outwardVouchers = ["Sales/Cr Mani", "Sales/CA", "Sales", "Sales/E", "Sales/slip"];
        const inwardVouchers = ["Purchase"];

        let inwardQty = 0;
        let outwardQty = 0;
        let stockitemname = "";
        let godownname = "";
        let batchname = "";

        stockitemname = element["allinventoryentries.stockitemname"];
        godownname = element["allinventoryentries.batchallocations.godownname"];
        batchname = element["allinventoryentries.batchallocations.batchname"];

        if (inwardVouchers.includes(element.vouchertypename.trim())) {
            inwardQty += qty;
        };

        if (qtyIn !== 0) {
            stockitemname = element["inventoryentriesin.stockitemname"];
            godownname = element["inventoryentriesin.batchallocations.godownname"];
            batchname = element["inventoryentriesin.batchallocations.batchname"];

            inwardQty += qtyIn;
        };

        if (qtyOut !== 0) {
            stockitemname = element["inventoryentriesout.stockitemname"];
            godownname = element["inventoryentriesout.batchallocations.godownname"];
            batchname = element["inventoryentriesout.batchallocations.batchname"];

            outwardQty += qtyOut;
        };

        if (outwardVouchers.includes(element.vouchertypename.trim())) {
            outwardQty = qty;
        };
        // console.log("sssss : ", inwardQty, outwardQty, qtyStr, qty, element.vouchertypename);

        return {
            "vouchertypename": element.vouchertypename,
            "date": element.date,
            "vouchernumber": element.vouchernumber,
            stockitemname,
            "qty": qty,
            "uom": uom,
            godownname,
            batchname,
            "inwardQty": inwardQty,
            "outwardQty": outwardQty
        }
    });

    return convertedArray;
};

const flattenedList = flattenInventoryBatchAllocations({ inData: rawData });

fs.writeFileSync("flat.json", JSON.stringify(flattenedList));


