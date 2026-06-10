const startFunc = ({ inTallyJson, inClientData }) => {
    try {
        let data = inTallyJson;

        const LocalClientData = inClientData;

        changeCustomerDetails({
            inLedgerName: LocalClientData.customerDetails.LedgerName,
            inData: data,
            inGstregistrationtype: LocalClientData.customerDetails.GstRegistrationType,
            inPartygstin: LocalClientData.customerDetails.PartyGSTIN
        });

        changeVoucherDate({
            inData: data,
            inDate: LocalClientData.customerDetails.InvoiceDate
        });

        return data;
    } catch (err) {
        console.error("Import Failed");
        console.log(err.response?.data || err.message);
    };
};

const changeCustomerDetails = ({ inLedgerName, inData, inGstregistrationtype, inPartygstin }) => {
    const CommonLedgerName = inLedgerName;

    inData.tallymessage[0].partyname = CommonLedgerName;
    inData.tallymessage[0].basicbuyername = CommonLedgerName;
    inData.tallymessage[0].partyledgername = CommonLedgerName;
    inData.tallymessage[0].consigneemailingname = CommonLedgerName;
    inData.tallymessage[0].partymailingname = CommonLedgerName;
    inData.tallymessage[0].basicbasepartyname = CommonLedgerName;
    inData.tallymessage[0].gstregistrationtype = inGstregistrationtype;
    inData.tallymessage[0].partygstin = inPartygstin;
};

const changeVoucherDate = ({ inData, inDate }) => {
    const localDate = inDate;

    inData.tallymessage[0].date = localDate;
    inData.tallymessage[0].vchstatusdate = localDate;
    inData.tallymessage[0].effectivedate = localDate;
};

export default startFunc;