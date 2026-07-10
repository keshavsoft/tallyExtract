// src/v1/api/stockItems.js
import { sendToTally } from "../../core/sendToTallyV1.js";

const startFunc = ({ inSvCurrentCompany }) => {
    return sendToTally({
        inTdlName: "KeshavAllLedgerEntries",
        inSvCurrentCompany
    });
};

export default startFunc;
// KeshavInventoryEntries