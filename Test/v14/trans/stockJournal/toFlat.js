import { xmlToJson } from "../../../xmlToJson.js";
import fs from "fs";

const xml1 = `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>EXPORT</TALLYREQUEST>
        <TYPE>COLLECTION</TYPE>
        <ID>KeshavSalesInventory</ID>
    </HEADER>

    <BODY>

        <DESC>

            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <SVFROMDATE TYPE="Date">1-Apr-2026</SVFROMDATE>
                <SVTODATE TYPE="Date">1-Sep-2026</SVTODATE>
            </STATICVARIABLES>

            <TDL>
                <TDLMESSAGE>

                  <COLLECTION NAME="KeshavSalesInventory">

    <TYPE>Vouchers:VoucherType</TYPE>

    <CHILDOF>$$VchTypePurchase</CHILDOF>

    <BELONGSTO>Yes</BELONGSTO>

    <FETCH>
        AllInventoryEntries
    </FETCH>

</COLLECTION>

</TDLMESSAGE>
            </TDL>

        </DESC>

    </BODY>

</ENVELOPE>`;


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
                <SVFROMDATE TYPE="Date">1-Apr-2026</SVFROMDATE>
                <SVTODATE TYPE="Date">30-Apr-2026</SVTODATE>
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
        PartyLedgerName,
        AllInventoryEntries
    </FETCH>

</COLLECTION>

<SYSTEM TYPE="Formulae" NAME="IsStockJournal">
    $Parent:VoucherType:$VoucherTypeName = "Stock Journal"
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
    const vouchers =
        fromTally.ENVELOPE.BODY.DATA.COLLECTION.VOUCHER;

    const VOUCHERS = Array.isArray(vouchers)
        ? vouchers
        : [vouchers];

    const result = [];

    VOUCHERS.forEach(VOUCHER => {

        const inventoryItems =
            VOUCHER["ALLINVENTORYENTRIES.LIST"];

        const inventory = Array.isArray(inventoryItems)
            ? inventoryItems
            : [inventoryItems];

        inventory.forEach(item => {

            const batches = item["BATCHALLOCATIONS.LIST"];

            const batchArray = !batches
                ? []
                : Array.isArray(batches)
                    ? batches
                    : [batches];

            batchArray.forEach(batch => {

                result.push({
                    DATE: VOUCHER.DATE["#text"],
                    VOUCHERNUMBER: VOUCHER.VOUCHERNUMBER,
                    VOUCHERTYPENAME: VOUCHER.VOUCHERTYPENAME,

                    STOCKITEMNAME: item.STOCKITEMNAME,
                    RATE: item.RATE,
                    AMOUNT: item.AMOUNT,
                    ACTUALQTY: item.ACTUALQTY,
                    BILLEDQTY: item.BILLEDQTY,

                    GODOWNNAME: batch.GODOWNNAME,
                    BATCHNAME: batch.BATCHNAME,
                    BATCHAMOUNT: batch.AMOUNT,
                    BATCHACTUALQTY: batch.ACTUALQTY,
                    BATCHBILLEDQTY: batch.BILLEDQTY
                });

            });
        });
    });

    // console.log(result[0]);

    fs.writeFileSync("flat.json", JSON.stringify(result));

    return fromTally;
};

sendToTally()
    .then(() => {
        console.log("Done");
    })
    .catch(error => {
        console.error(error);
    });