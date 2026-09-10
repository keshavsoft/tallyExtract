import impotVoucher from "../../src/v11/core/impotVoucher.js";
import bill from './bill.json' with {type: 'json'};

impotVoucher(bill).then(res => console.log(res));