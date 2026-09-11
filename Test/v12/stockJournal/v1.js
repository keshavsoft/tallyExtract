import { xmlToJson } from "../xmlToJson.js";
import fs from "fs";

const xml = `<ENVELOPE>

    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>EXPORT</TALLYREQUEST>
        <TYPE>COLLECTION</TYPE>
        <ID>KeshavStockJournal</ID>
    </HEADER>

    <BODY>
        <DESC>

            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <SVFROMDATE>1-Apr-2026</SVFROMDATE>
                <SVTODATE>30-Apr-2026</SVTODATE>
            </STATICVARIABLES>

            <TDL>
                <TDLMESSAGE>

                    <COLLECTION NAME="KeshavStockJournal">
                        <TYPE>Voucher</TYPE>

                        <FILTER>
                            IsStockJournal
                        </FILTER>

                        <FETCH>
                            Date,
                            VoucherNumber,
                            VoucherTypeName,
                            Narration,
                            AllInventoryEntries.StockItemName,
                            AllInventoryEntries.BilledQty,
                            AllInventoryEntries.Rate,
                            AllInventoryEntries.Amount
                        </FETCH>
                    </COLLECTION>

                    <SYSTEM TYPE="Formulae" NAME="IsStockJournal">
                        $VoucherTypeName = "Stock Journal"
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