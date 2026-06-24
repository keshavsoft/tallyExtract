import { startFunc as ForLedger } from "./ForLedger/entryFile.js";
import { startFunc as ForInventory } from "./ForInventory/entryFile.js";
import changeCustomerDetails from "./ChangeCustomerDetails/index.js";

const startFunc = ({ inTallyJson, inClientData }) => {
    try {
        let data = inTallyJson;

        const LocalClientData = inClientData;

        const LocalInventoryItem = ForInventory({ inItemsJsonAsArray: LocalClientData.allinventoryentries });

        const LocalLedgerItem = ForLedger({
            inItemsJsonAsArray: LocalClientData.allinventoryentries,
            inLedgerDetails: LocalClientData.customerDetails
        });

        changeCustomerDetails({
            inTallyJson, inClientData
        });

        data.tallymessage[0].allinventoryentries = LocalInventoryItem;
        data.tallymessage[0].ledgerentries = LocalLedgerItem;

        return data;
    } catch (err) {
        console.error("Import Failed");
        console.log(err.response?.data || err.message);
    };
};

const changeCustomerDetails1 = ({ inLedgerName, inData }) => {
    const CommonLedgerName = inLedgerName;

    inData.tallymessage[0].partyname = CommonLedgerName;
    inData.tallymessage[0].basicbuyername = CommonLedgerName;
    inData.tallymessage[0].partyledgername = CommonLedgerName;
    inData.tallymessage[0].consigneemailingname = CommonLedgerName;
    inData.tallymessage[0].partymailingname = CommonLedgerName;
    inData.tallymessage[0].basicbasepartyname = CommonLedgerName;
    inData.tallymessage[0].gstregistrationtype = "Regular";
    inData.tallymessage[0].partygstin = "37BEVPS3045F1Z1";
};

const changeVoucherDate = ({ inData, inDate }) => {
    const localDate = inDate;

    inData.tallymessage[0].date = localDate;
    inData.tallymessage[0].vchstatusdate = localDate;
    inData.tallymessage[0].effectivedate = localDate;
};

export { startFunc };