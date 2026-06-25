import { sendToTally } from "../../core/sendToTallyV1.js";

const transform = ({ inDataFromTally }) => {
    const dataFromTally = inDataFromTally;

    const LocalNewArray = dataFromTally.map(element => {
        // console.log("element : ", element);

        if ("gstdetails" in element) {
            const gstdetails = element?.gstdetails.at(-1);

            let sgstRate;
            let cgstRate;

            if (gstdetails) {
                const ratedetails = gstdetails.statewisedetails[0].ratedetails;
                const sgst = ratedetails.find(element => element.gstratedutyhead === "SGST/UTGST");
                const cgst = ratedetails.find(element => element.gstratedutyhead === "CGST");

                sgstRate = sgst?.gstrate;
                cgstRate = cgst?.gstrate;
            };

            return {
                StockItemName: element.metadata.name,
                StockItemReservedName: element.metadata.reservedname,
                StockItemType: element.metadata.type,
                StockParentName: element.parent.value,
                StockCategory: element.category.value,
                StockGstApplicable: element.gstapplicable.value,
                StockGstTypeOfSupply: element.gsttypeofsupply.value,
                StockBaseUnits: element.baseunits.value,
                sgstRate,
                cgstRate,
                TaxPer: parseFloat(sgstRate) + parseFloat(cgstRate),
                Uom: element.baseunits.value,
            };
        };

        return {
            StockItemName: element.metadata.name,
            StockItemReservedName: element.metadata.reservedname,
            StockItemType: element.metadata.type,
            StockParentName: element.parent.value,
            StockCategory: element.category.value,
            StockBaseUnits: element.baseunits.value,
            Uom: element.baseunits.value,
        };
    });

    return LocalNewArray;
};

const stockItemsV1 = async ({ inSvCurrentCompany }) => {
    const dataFromTally = await sendToTally({
        inTdlName: "KeshavStockItems",
        inSvCurrentCompany
    });
    // console.log("dataFromTally : ", dataFromTally);

    const transformedArray = transform({ inDataFromTally: dataFromTally.data.collection });

    return await transformedArray;
};

export default stockItemsV1;