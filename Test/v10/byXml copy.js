const getLastVoucher = async (url = "http://localhost:9000") => {
    const xml = `
<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>EXPORT</TALLYREQUEST>
        <TYPE>COLLECTION</TYPE>
        <ID>KeshavNextVoucherID</ID>
    </HEADER>

    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>

            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="KeshavNextVoucherID">
                        <TYPE>Company</TYPE>
                        <FETCH>CmpVchID</FETCH>
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

getLastVoucher().then(console.log);