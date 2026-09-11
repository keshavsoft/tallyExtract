import { xmlToJson } from "../../../xmlToJson.js";
import fs from "fs";

const xml = `<ENVELOPE>
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
                <SVTODATE TYPE="Date">1-Apr-2026</SVTODATE>
            </STATICVARIABLES>

            <TDL>
                <TDLMESSAGE>

                  <COLLECTION NAME="KeshavSalesInventory">

    <TYPE>Vouchers:VoucherType</TYPE>

    <CHILDOF>$$VchTypeSales</CHILDOF>

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

    const result = VOUCHERS.map(VOUCHER => {

        const inventoryItems =
            VOUCHER["ALLINVENTORYENTRIES.LIST"];

        const inventory = (
            Array.isArray(inventoryItems)
                ? inventoryItems
                : [inventoryItems]
        ).map(item => {

            const batches = item["BATCHALLOCATIONS.LIST"];

            let cleanBatches = [];

            if (batches) {

                const batchArray = Array.isArray(batches)
                    ? batches
                    : [batches];

                cleanBatches = batchArray.map(batch => ({
                    GODOWNNAME: batch.GODOWNNAME,
                    BATCHNAME: batch.BATCHNAME,
                    AMOUNT: batch.AMOUNT,
                    ACTUALQTY: batch.ACTUALQTY,
                    BILLEDQTY: batch.BILLEDQTY
                }));
            }

            return {
                STOCKITEMNAME: item.STOCKITEMNAME,
                RATE: item.RATE,
                AMOUNT: item.AMOUNT,
                ACTUALQTY: item.ACTUALQTY,
                BILLEDQTY: item.BILLEDQTY,
                BATCHES: cleanBatches
            };
        });

        return {
            DATE: VOUCHER.DATE["#text"],
            VOUCHERNUMBER: VOUCHER.VOUCHERNUMBER,
            VOUCHERTYPENAME: VOUCHER.VOUCHERTYPENAME,
            INVENTORY: inventory
        };
    });

    // console.log(result[0]);

       fs.writeFileSync("data.json", JSON.stringify(result));

    return fromTally;
};

sendToTally()
    .then(() => {
        console.log("Done");
    })
    .catch(error => {
        console.error(error);
    });