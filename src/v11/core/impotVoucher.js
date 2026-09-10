const startFunc = async (data, url = "http://localhost:9000") => {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "TallyRequest": "Import",
            "Type": "Data",
            "Id": "Vouchers"
        },
        body: JSON.stringify(data)
    });

    const fromTally = await res.json();

    return await fromTally;
};

export default startFunc;