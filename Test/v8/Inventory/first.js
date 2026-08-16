import { inventoryV3 } from "../../../index.js";

inventoryV3({ inSvCurrentCompany: "me" }).then(promiseData => {
    console.log("purchases first : ", promiseData[0]);
});