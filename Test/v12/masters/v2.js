const BODY = {
    static_variables: [
        {
            name: "svExportFormat",
            value: "JSONEx"
        },
        {
            name: "svCurrentCompany",
            value: "Mani9"
        }
    ]
};

const sendToTally = async ({
    url = "http://localhost:9000"
} = {}) => {

    const res = await fetch(url, {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Version": "1",
            "TallyRequest": "Export",
            "Type": "Collection",
            "Id": "StockItem"
        },

        body: JSON.stringify(BODY)
    });

    if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
    }

    const fromTally = await res.json();

    console.dir(
        fromTally.data.collection[0],
        { depth: null }
    );

    return fromTally;
};

sendToTally()
    .then(() => {
        console.log("Done");
    })
    .catch(error => {
        console.error(error);
    });