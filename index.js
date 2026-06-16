import getLatestVersion from "./src/core/getLatestVersion.js";

const load = async () => {
    const v = getLatestVersion();

    return (await import(
        `./src/${v}/api/index.js`
    ));
};

export default load;