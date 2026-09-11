import { xmlToJson } from "../../xmlToJson.js";
import fs from "fs";

const xml = `<ENVELOPE>

    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>EXPORT</TALLYREQUEST>
        <TYPE>COLLECTION</TYPE>
        <ID>KeshavOpenCompanies</ID>
    </HEADER>

    <BODY>
        <DESC>

            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>

            <TDL>
                <TDLMESSAGE>

                  <COLLECTION NAME="KeshavOpenCompanies">
    <TYPE>Company</TYPE>
    <FETCH>
        Name
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
console.log("fromTally : ", fromTally.ENVELOPE.BODY.DATA.COLLECTION.COMPANY);

    // fs.writeFileSync("data.json", JSON.stringify(fromTally));

    return fromTally;
};

sendToTally()
    .then(() => {
        console.log("Done");
    })
    .catch(error => {
        console.error(error);
    });