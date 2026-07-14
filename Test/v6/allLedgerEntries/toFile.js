import fs from "fs";
import { allLedgerEntriesV2 } from "../../../index.js";

const jsonFileName = "purExpVouchers.json";

const filterArray = (inData) => {
    const filteredRows = inData.filter(element => {
        return "allledgerentries" in element;
        // return element.vchtype === "Pur Exp";
    });

    return filteredRows;
};

allLedgerEntriesV2({ inSvCurrentCompany: "me" }).then(promiseData => {
    const filteredRows = filterArray(promiseData);

    fs.writeFileSync(jsonFileName, JSON.stringify(filteredRows));
});