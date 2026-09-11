import { XMLParser } from "fast-xml-parser";

const xmlToJson = (xml) => {
    const parser = new XMLParser({
        ignoreAttributes: false
    });

    return parser.parse(xml);
};

export {
    xmlToJson
};