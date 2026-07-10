import fs from "fs";
import { allLedgerEntriesV2 } from "../../../index.js";

const filterArray = (inData) => {
    const filteredRows = inData.filter(element => {
        return "allledgerentries" in element;
        // return element.vchtype === "Pur Exp";
    });

    return filteredRows;
    // console.log(purExpVouchers[0].allledgerentries.length);
};

allLedgerEntriesV2({ inSvCurrentCompany: "me" }).then(promiseData => {
    const filteredRows = filterArray(promiseData);

    fs.writeFileSync("purExpVouchers.json", JSON.stringify(filteredRows));
});