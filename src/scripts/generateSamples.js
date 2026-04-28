import fs from "fs";
import path from "path";
import { kschema } from "../v12/index.js";

const OUTPUT_DIR = path.resolve("samples");

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const table = kschema.table("SampleTable");

// Query methods
Object.keys(table.query).forEach((key) => {
    if (key === "aggregate") return;

    const filePath = path.join(OUTPUT_DIR, `query_${key}.js`);

    const content = `import { kschema } from "@keshavsoft/kschema";

const table = kschema.table("SampleTable");

console.log(table.query.${key}());
`;

    fs.writeFileSync(filePath, content);
});

// Aggregate
Object.keys(table.query.aggregate || {}).forEach((key) => {
    const filePath = path.join(OUTPUT_DIR, `aggregate_${key}.js`);

    const content = `import { kschema } from "@keshavsoft/kschema";

const table = kschema.table("SampleTable");

console.log(table.query.aggregate.${key}());
`;

    fs.writeFileSync(filePath, content);
});

// Mutate
Object.keys(table.mutate).forEach((key) => {
    const filePath = path.join(OUTPUT_DIR, `mutate_${key}.js`);

    const content = `import { kschema } from "@keshavsoft/kschema";

const table = kschema.table("SampleTable");

console.log(table.mutate.${key}({}));
`;

    fs.writeFileSync(filePath, content);
});

console.log("Samples generated 🚀");