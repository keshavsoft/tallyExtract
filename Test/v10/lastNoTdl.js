const getLastVoucher = async (url = "http://localhost:9000") => {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Version": "1",
            "TallyRequest": "Export",
            "Type": "Collection",
            "Id": "Keshav1"
        },
        body: JSON.stringify({
            "static_variables": [
                {
                    "name": "svExportFormat",
                    "value": "JSONEx"
                }
            ],
            "tdlmessage": [
                {
                    "definitions": [
                        {
                            "collection": {
                                "name": "Keshav1",
                                "attributes": [
                                    {
                                        "key": "Type",
                                        "value": "Company"
                                    },
                                    {
                                        "key": "Fetch",
                                        "value": "CmpVchID"
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        })
    });

    return await res.json();
};

getLastVoucher().then(res => console.dir(res, { depth: null }));