import { startFunc as prepareClientData } from "./prepareClientData.js";
import { startFunc as prepareTallyJson } from "./prepareTallyJson/entryFile.js";

const startFunc = ({ inClientData }) => {
    try {
        let data = prepareTallyJson();

        const fromClientData = prepareClientData({
            inTallyJson: data,
            inClientData
        });

        return fromClientData;
    } catch (err) {
        console.error("Import Failed");
        console.log(err.response?.data || err.message);
    };
};

export { startFunc };