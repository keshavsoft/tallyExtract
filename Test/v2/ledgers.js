import { ledger } from "../../src/v8/api/ledger.js";

ledger().then(promiseData => {
    console.log("ledger data : ", promiseData.data.collection);
});