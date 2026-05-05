import required from "./validators/required.js";
import type from "./validators/type.js";
import minMax from "./validators/minMax.js";
import length from "./validators/length.js";
import enumCheck from "./validators/enum.js";
import pattern from "./validators/pattern.js";
import setDefault from "./validators/default.js";

const validators = [required, type, minMax, length, enumCheck, pattern];

const validate = (schema, record) => {
    if (!schema?.columns) throw new Error("Invalid schema");

    for (const col of schema.columns) {
        if (!col.isConsider) continue;

        setDefault(col, record); // 🔥 mutate first

        const value = record[col.field];

        for (const fn of validators) {
            fn(col, value, record);
        }
    }
};

export default validate;