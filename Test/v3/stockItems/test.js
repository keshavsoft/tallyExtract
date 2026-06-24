import { inventoryV1 } from "../../../index.js";

inventoryV1({ inSvCurrentCompany: "me" }).then(promiseData => {
    console.log("stockItemsData : ", promiseData.data.collection[0]);
});