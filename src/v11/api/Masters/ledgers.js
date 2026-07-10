import { sendToTally } from "../../core/sendToTallyV1.js";

const transform = ({ inDataFromTally }) => {
    const dataFromTally = inDataFromTally;

    const LocalNewArray = dataFromTally.map(element => {
        return {
            LedgerName: element.metadata.name,
            LedgerParentName: element.parent.value,
            LedgerType: element.metadata.type,
            GstRegistrationType: element.gstregistrationtype.value,
            PartyGSTIN: element.partygstin.value
        };
    });

    return LocalNewArray;
};

const startFunc = async ({ inSvCurrentCompany }) => {
    const dataFromTally = await sendToTally({
        inTdlName: "KeshavLedgers",
        inSvCurrentCompany
    });
    // console.log("dataFromTally : ", dataFromTally);

    const transformedArray = transform({ inDataFromTally: dataFromTally.data.collection });
    // return await dataFromTally.data.collection;
    return await transformedArray;
};

export default startFunc;