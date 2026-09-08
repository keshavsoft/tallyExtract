import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateStruct7File } from "./read_struct_7.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

generateStruct7File({
    inInputFilePath: path.join(__dirname, "data.json"),
    inWantFilePath: path.join(__dirname, "want.json"),
    inOutputFilePath: path.join(__dirname, "struct_8.json")
});
