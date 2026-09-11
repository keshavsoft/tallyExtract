import { xmlToJson } from "../xmlToJson.js";
import fs from "fs";

const xml = `<ENVELOPE>

    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>EXPORT</TALLYREQUEST>
        <TYPE>COLLECTION</TYPE>
        <ID>KeshavVoucherTypes</ID>
    </HEADER>

    <BODY>
        <DESC>

            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>

            <TDL>
                <TDLMESSAGE>

                    <COLLECTION NAME="KeshavVoucherTypes">

                        <TYPE>VoucherType</TYPE>

                        <FETCH>
                            Name,
                            Parent,
                            IsDeemedPositive,
                            IsOptional,
                            IsActive
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