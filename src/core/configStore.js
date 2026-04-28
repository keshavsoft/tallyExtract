let _config = null;

export const loadConfig = (config) => {
    _config = config;
};

export const getConfig = () => {
    if (!_config) throw new Error("Config not loaded");
    return _config;
};