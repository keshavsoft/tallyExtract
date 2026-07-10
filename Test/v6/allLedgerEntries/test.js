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
        return element.metadata.vchtype === "Pur Exp";
    });

    return purExpVouchers;
    // console.log(purExpVouchers[0].allledgerentries.length);
};

allLedgerEntriesV1({ inSvCurrentCompany: "me" }).then(promiseData => {
    // console.log("inventoryV1 : ", promiseData.data.collection[0]);

    //     const uniqueVchTypes = [
    //         ...new Set(
    //             promiseData.data.collection.map(item => item.metadata.vchtype)
    //         )
    //     ];
    // uniqueVchTypes(promiseData.data.collection);
    const purExpVouchers = onlyPurExp(promiseData.data.collection);

    console.log(purExpVouchers[0].allledgerentries.length);
});