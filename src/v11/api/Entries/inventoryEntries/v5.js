import { sendToTally } from "../../../core/sendToTallyV1.js";

const toYYYYMMDD = (date) => {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
};

const transform = ({ inDataFromTally }) => {
    const dataFromTally = inDataFromTally;

    const filteredArray = dataFromTally.filter(element => "allinventoryentries" in element);

    const LocalNewArray = filteredArray.map(element => {
        const localInventoryentries = element.allinventoryentries.map(loopItem => {
            const localBatchentries = loopItem.batchallocations.map(loopBatch => {
                return {
                    godownname: loopBatch?.godownname,
                    batchname: loopBatch?.batchname,
                    destinationgodownname: loopBatch?.destinationgodownname,
                    amount: loopBatch?.amount,
                    actualqty: loopBatch?.actualqty,
                    billedqty: loopBatch?.billedqty
                };
            });

            return {
                stockitemname: loopItem?.stockitemname,
                rate: loopItem?.rate,
                amount: loopItem?.amount,
                actualqty: loopItem?.actualqty,
                billedqty: loopItem?.billedqty,
                batchallocations: localBatchentries,
                basicuserdescription: loopItem?.basicuserdescription
            };
        });

        return {
            type: element.metadata.type,
            vchtype: element.metadata.vchtype,
            date: toYYYYMMDD(element.date.value),
            vouchernumber: element.vouchernumber,
            numberingstyle: element.numberingstyle,
            isdeleted: element.isdeleted,
            vouchernumberseries: element.vouchernumberseries.value,
            allinventoryentries: localInventoryentries
        };
    });


    return LocalNewArray;
};

const startFunc = async ({ inSvCurrentCompany }) => {
    const dataFromTally = await sendToTally({
        inTdlName: "KeshavAllInventoryEntries",
        inSvCurrentCompany
    });

    const transformedArray = transform({ inDataFromTally: dataFromTally.data.collection });
    // return await dataFromTally.data.collection;
    return await transformedArray;
};

export default startFunc;