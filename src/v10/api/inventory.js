// src/v1/api/stockItems.js
import { sendToTally } from "../core/sendToTallyV1.js";

export function inventoryV1({ inSvCurrentCompany }) {

    return sendToTally({
        inTdlName: "KeshavInventoryEntries",
        inSvCurrentCompany
    });
};