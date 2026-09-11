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
    ],

    tdlmessage: [
        {
            descriptions: [
                {
                    metadata: {
                        type: "Collection",
                        name: "KeshavStockItems1"
                    },
                    attributes: [
                        {
                            key: "Type",
                            value: "StockItem"
                        },
                        {
                            key: "Fetch",
                            value: "Name, Parent, Category, BaseUnits, GSTApplicable, GSTTypeOfSupply, GSTDetails"
                        },
                        {
                            key: "Format",
                            value: "JSON"
                        }
                    ]
                }
            ]
        },
        {
            definitions: []
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
            "Id": "KeshavStockItems1"
        },

        body: JSON.stringify(BODY)
    });

    const text = await res.text();

    console.log("STATUS:", res.status);
    console.log("RESPONSE:");
    console.log(text);

    try {
        const data = JSON.parse(text);

        console.dir(
            data,
            { depth: null }
        );

        return data;

    } catch {
        return text;
    }
};

sendToTally()
    .then(() => {
        console.log("Done");
    })
    .catch(error => {
        console.error(error);
    });