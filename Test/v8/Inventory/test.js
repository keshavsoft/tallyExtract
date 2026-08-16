import { inventoryV1 } from "../../../index.js";

const uniqueVchTypes = (inData) => {
    const uniqueVchTypes = [
        ...new Set(
            inData.map(item => item.metadata.vchtype)
        )
    ];

    console.log(uniqueVchTypes);
};

const onlySales = (inData) => {

    const purExpVouchers = inData.filter(element => {
        return element.metadata.vchtype === "Sales";
    });

    console.log(purExpVouchers[0]);
};


const onlyPurExp = (inData) => {
    const purExpVouchers = inData.filter(element => {
        return element.metadata.vchtype === "Pur Exp";
    });

    console.log(purExpVouchers[0].allledgerentries.length);
};


inventoryV1({ inSvCurrentCompany: "me" }).then(promiseData => {
    // console.log("inventoryV1 : ", promiseData.data.collection[0]);

    //     const uniqueVchTypes = [
    //         ...new Set(
    //             promiseData.data.collection.map(item => item.metadata.vchtype)
    //         )
    //     ];
    // uniqueVchTypes(promiseData.data.collection);
    onlyPurExp(promiseData.data.collection);
    // const purExpVouchers = promiseData.data.collection.filter(element => {
    //     return element.metadata.vchtype === "Pur Exp";
    // });


    // console.log(purExpVouchers[0]);

});