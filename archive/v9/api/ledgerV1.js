import { sendToTally } from "../core/sendToTallyV1.js";

export function ledgerV1({ inSvCurrentCompany }) {

    return sendToTally({
        inTdlName: "KeshavLedgers",
        inSvCurrentCompany
    });
};