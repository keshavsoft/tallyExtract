const getLastVoucher = async (url = "http://localhost:9000") => {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Version": "1",
            "TallyRequest": "Export",
            "Type": "Collection",
            "Id": "KeshavNextVoucherID"
        },
        body: JSON.stringify({
            static_variables: [
                {
                    type: "String",
                    name: "SVExportFormat",
                    value: "JSONEx"
                }
            ]
        })
    });

    return await res.json();
};

getLastVoucher().then(res => console.dir(res, { depth: null }));