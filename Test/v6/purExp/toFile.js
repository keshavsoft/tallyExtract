import fs from "fs";
import { allLedgerEntriesV1 } from "../../../index.js";

const uniqueVchTypes = (inData) => {
    const uniqueVchTypes = [
        ...new Set(
            inData.map(item => item.metadata.vchtype)
        )
    ];

    console.log(uniqueVchTypes);
};

const onlyPurExp = (inData) => {
    const purExpVouchers = inData.filter(element => {
        return element.vchtype === "Pur Exp";
    });

    return purExpVouchers;
    // console.log(purExpVouchers[0].allledgerentries.length);
};

allLedgerEntriesV1({ inSvCurrentCompany: "me" }).then(promiseData => {
    const purExpVouchers = onlyPurExp(promiseData);

    fs.writeFileSync("purExpVouchers.json", JSON.stringify(purExpVouchers));
});