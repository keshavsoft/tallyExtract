#!/usr/bin/env node

console.log("kschema CLI running 🚀");

const args = process.argv.slice(2);

console.log("Args:", args);

if (args[0] === "init") {
    console.log("Init command triggered");
};