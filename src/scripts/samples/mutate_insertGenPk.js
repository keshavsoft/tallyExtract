import { kschema } from "@keshavsoft/kschema";

const table = kschema.table("SampleTable");

console.log(table.mutate.insertGenPk({}));
