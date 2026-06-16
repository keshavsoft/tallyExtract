import load from "../../../index.js";

const api = await load();

api.stockItems({}).then(promiseData => {
    console.log("stockItemsData : ", promiseData);
});