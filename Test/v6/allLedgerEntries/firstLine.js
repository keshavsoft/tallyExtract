import { allLedgerEntriesV2 } from "../../../index.js";

const filterArray = (inData) => {
    const filteredRows = inData.filter(element => {
        return "allledgerentries" in element;
        // return element.vchtype === "Pur Exp";
    });

    return filteredRows;
};

allLedgerEntriesV2({ inSvCurrentCompany: "me" }).then(promiseData => {
    const filteredRows = filterArray(promiseData);

    // console.log(filteredRows.length);
    console.log(JSON.stringify(filteredRows[0], null, 4));
    // fs.writeFileSync(jsonFileName, JSON.stringify(filteredRows));
});