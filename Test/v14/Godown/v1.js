import { xmlToJson } from "../../xmlToJson.js";
import fs from "fs";

const xml = `<ENVELOPE>

    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>EXPORT</TALLYREQUEST>
        <TYPE>COLLECTION</TYPE>
        <ID>KeshavGodowns</ID>
    </HEADER>

    <BODY>
        <DESC>

            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>

            <TDL>
                <TDLMESSAGE>

                <COLLECTION NAME="KeshavGodowns">
    <TYPE>Godown</TYPE>
    <FETCH>
        Name,
        Parent
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
console.log("text : ", text);


//     const fromTally = xmlToJson(text);
// console.log("fromTally : ", fromTally.ENVELOPE.BODY.DATA.COLLECTION.COMPANY);

    // fs.writeFileSync("data.json", JSON.stringify(fromTally));

    return text;
};

sendToTally()
    .then(() => {
        console.log("Done");
    })
    .catch(error => {
        console.error(error);
    });