// import getLatestVersion from "./src/core/getLatestVersion.js";

// const load = async (cmd) => {
//     const v = getLatestVersion();
//     return (await import(`./src/${v}/commands/exportCommands/${cmd}.js`)).default;
// };

// export const express = async (...a) => (await load("express"))(...a);


export * from "./src/v8/index.js";
