const getLastVoucher = async (url = "http://localhost:9000") => {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Version": "1",
            "TallyRequest": "Export",
            "Type": "Data",
            "Id": "Vouchers"
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
                                "name": "Vouchers",
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