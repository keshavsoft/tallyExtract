import { inventoryV1 } from "../../../index.js";

inventoryV1({ inSvCurrentCompany: "me" }).then(promiseData => {
    const purchasesOnly = promiseData.data.collection.filter(element => {
        // console.log("element.vouchertypename : ", element.vouchertypename);

        return element.vouchertypename === "Purchase";
    });

    // const fieldsNeededOnly = array.forEach(element => {

    // });

    console.log("inventoryV1 : ", purchasesOnly[0]);
});