import impotVoucher from "../../src/v11/core/impotVoucher.js";

import bill from './bill.json' with {type: 'json'};
import item from './item.json' with {type: 'json'};
import ledger from './ledger.json' with {type: 'json'};

bill.tallymessage[0].allinventoryentries.push(item);
bill.tallymessage[0].ledgerentries.push(ledger);

impotVoucher(bill).then(res => console.log(res));