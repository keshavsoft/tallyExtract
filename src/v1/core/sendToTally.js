// src/v1/core/sendToTally.js
const BODY = {
    static_variables: [
        { name: "svExportFormat", value: "jsonex" }
    ]
};

export async function sendToTally(Id, url = "http://localhost:9000") {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "TallyRequest": "Export",
            "Type": "Collection",
            "Id": Id
        },
        body: JSON.stringify(BODY)
    });

    return res.json();
};