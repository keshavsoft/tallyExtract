import insertBase from "./insertBase.js";

const isPlainObject = (val) =>
    typeof val === "object" && val !== null && !Array.isArray(val);

const isPrimitive = (val) =>
    val === null ||
    ["string", "number", "boolean"].includes(typeof val);

const insertFlat = ({ table, record }) => {
    if (!isPlainObject(record)) {
        throw new Error("must be object");
    }

    for (const key in record) {
        if (!isPrimitive(record[key])) {
            throw new Error(`invalid value for ${key}`);
        }
    }

    return insertBase({ table, record });   // 🔥 reuse
};

export default insertFlat;