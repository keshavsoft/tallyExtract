const getCompanyName = async (url = "http://localhost:9000") => {
    const xml = `
<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>EXPORT</TALLYREQUEST>
        <TYPE>COLLECTION</TYPE>
        <ID>CompanyInfo</ID>
    </HEADER>

    <BODY>
        <DESC>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="CompanyInfo">
                        <TYPE>Company</TYPE>
                        <NATIVEMETHOD>Name</NATIVEMETHOD>
                    </COLLECTION>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "text/xml"
        },
        body: xml
    });

    return await res.text();
};

getCompanyName().then(console.log);