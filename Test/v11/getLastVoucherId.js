import getLastVoucherId from "../../src/v11/core/getLastVoucherId.js";

getLastVoucherId().then(xml => {
    const start = xml.indexOf("<CMPVCHID");
    const valueStart = xml.indexOf(">", start) + 1;
    const valueEnd = xml.indexOf("</CMPVCHID>", valueStart);

    const voucherId = xml.substring(valueStart, valueEnd);

    console.log(voucherId);
});
