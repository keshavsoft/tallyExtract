import { xmlToJson } from "../../../xmlToJson.js";
import fs from "fs";

const xml = `<ENVELOPE>

    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>EXPORT</TALLYREQUEST>
        <TYPE>COLLECTION</TYPE>
        <ID>KeshavSalesVouchers</ID>
    </HEADER>

    <BODY>
        <DESC>

            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <SVFROMDATE TYPE="Date">1-Apr-2026</SVFROMDATE>
                <SVTODATE TYPE="Date">1-Apr-2026</SVTODATE>
            </STATICVARIABLES>

            <TDL>
                <TDLMESSAGE>

                <COLLECTION NAME="KeshavSalesVouchers">

    <TYPE>Voucher</TYPE>

    <FILTER>
        IsSalesFamily
    </FILTER>

    <FETCH>
 Date,
    VoucherNumber,
    VoucherTypeName,
    Narration,

    LedgerEntries.*,
    InventoryEntries.*
    </FETCH>

</COLLECTION>

                    <SYSTEM TYPE="Formulae" NAME="IsSalesFamily">
                        $Parent:VoucherType:$VoucherTypeName = "Purchase"
                    </SYSTEM>

                </TDLMESSAGE>
            </TDL>

        </DESC>
    </BODY>

</ENVELOPE>`;

const sendToTally = async ({
    url = "http://localhost:9000"
} = {}) => {

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "text/xml"
        },
        body: xml
    });

    const text = await res.text();

    const fromTally = xmlToJson(text);

    fs.writeFileSync("data.json", JSON.stringify(fromTally));

    return fromTally;
};

sendToTally()
    .then(() => {
        console.log("Done");
    })
    .catch(error => {
        console.error(error);
    });