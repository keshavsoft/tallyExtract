import { sendToTally } from "../../../core/sendToTallyV1.js";

const toYYYYMMDD = (date) => {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
};

const transform = ({ inDataFromTally }) => {
    const dataFromTally = inDataFromTally;

    const filteredArray = dataFromTally.filter(element => "allledgerentries" in element);

    const LocalNewArray = filteredArray.map(element => {

        const LocalLedgerentries = element.allledgerentries.map(loopLedgers => {
            return {
                ledgername: loopLedgers.ledgername,
                credit: loopLedgers.amount > 0 ? parseFloat(loopLedgers.amount) : 0,
                debit: loopLedgers.amount < 0 ? -parseFloat(loopLedgers.amount) : 0
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
            allledgerentries: LocalLedgerentries
        };
    });


    return LocalNewArray;
};

const startFunc = async ({ inSvCurrentCompany }) => {
    const dataFromTally = await sendToTally({
        inTdlName: "KeshavAllLedgerEntries",
        inSvCurrentCompany
    });
    // console.log("aaaaa : ", dataFromTally);

    const transformedArray = transform({ inDataFromTally: dataFromTally.data.collection });
    // return await dataFromTally.data.collection;
    return await transformedArray;
};

export default startFunc;