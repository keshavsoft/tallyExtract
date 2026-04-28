import insertBase from "./insertBase.js";

const insertAsIs = ({ table, record }) => {
    return insertBase({ table, record });
};

export default insertAsIs;