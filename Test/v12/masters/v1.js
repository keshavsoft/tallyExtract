const BODY = {
    static_variables: [
        { name: "svExportFormat", value: "jsonex" },
        { name: "svCurrentCompany", value: "Mani9" }
    ]
};

const sendToTally = async ({ url = "http://localhost:9000" }) => {

    const res = await fetch("http://localhost:9000", {
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

    const fromTally = await res.json();

    console.log("jjjjjjj : ", fromTally.data.collection[0]);
    console.dir(
        fromTally.data.collection[0],
        { depth: null }
    );
    return fromTally;
};

sendToTally({}).then();