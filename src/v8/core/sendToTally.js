// src/v1/core/sendToTally.js
const BODY = {
    static_variables: [
        { name: "svExportFormat", value: "jsonex" },
        {
            name: "svCurrentCompany",
            value: "Mani9"
        }
    ]
};

export async function sendToTally({ inTdlName, url = "http://localhost:9000",
    inSvCurrentCompany = "Mani9"
}) {
    BODY.static_variables[1].value = inSvCurrentCompany;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "TallyRequest": "Export",
            "Type": "Collection",
            "Id": inTdlName
        },
        body: JSON.stringify(BODY)
    });

    return res.json();
};