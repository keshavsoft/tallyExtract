export async function sendToTally(data, url = "http://localhost:9000") {
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

    return res.json();
};