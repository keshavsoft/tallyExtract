// src/v1/api/stockItems.js
import { sendToTally } from "../../core/sendToTallyV1.js";

const transform = ({ inDataFromTally }) => {
    const dataFromTally = inDataFromTally;

    const LocalNewArray = dataFromTally.map(element => {
        return {
            type: element.metadata.type,
            vchtype: element.metadata.vchtype,
            date: element.date.value,
            vouchernumber: element.vouchernumber,
            numberingstyle: element.numberingstyle,
            isdeleted: element.isdeleted,
            vouchernumberseries: element.vouchernumberseries.value,
            allledgerentries: element.allledgerentries
        };
    });

    return LocalNewArray;
};

const startFunc = async ({ inSvCurrentCompany }) => {
    const dataFromTally = await sendToTally({
        inTdlName: "KeshavAllLedgerEntries",
        inSvCurrentCompany
    });
    console.log("aaaaa : ", dataFromTally);

    const transformedArray = transform({ inDataFromTally: dataFromTally.data.collection });
    // return await dataFromTally.data.collection;
    return await transformedArray;
};

export default startFunc;
// KeshavInventoryEntries