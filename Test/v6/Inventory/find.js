import { inventoryV1 } from "../../../index.js";

inventoryV1({ inSvCurrentCompany: "me" }).then(promiseData => {
    const data = promiseData.data.collection;

    // const find = data.find(element => {
    //     return element.metadata.vchtype === "Purchase";
    // });

    const filter = data.filter(element => {
        return element.metadata.vchtype === "Purchase";
    });

    // console.log("stockItemsData : ", find.allinventoryentries[0]);
    console.log("stockItemsData : ", filter.length);
});