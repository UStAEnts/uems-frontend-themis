/**
 * Contains all available keys in this configuration.
 */
export type ConfigType = {
    BASE_GATEWAY_URI: string,
}

/**
 * The configuration overrides to be applied when in a production environment
 */
const production: Partial<ConfigType> = {
    BASE_GATEWAY_URI: 'http://gateway.uems.entscrew.net/',
};

/**
 * The configuration overrides to be applied when we are in a development-docker environment (when access to local
 * docker networking is available)
 */
const docker: Partial<ConfigType> = {
    BASE_GATEWAY_URI: 'http://uems-gateway:15450/',
};

/**
 * The configuration overrides to be applied when we are in a complete development environment
 */
const development: Partial<ConfigType> = {
    BASE_GATEWAY_URI: '/api',
};

/**
 * A set of default configuration options which can be overwritten but provide the base to the config
 */
const defaults: Partial<ConfigType> = {};

/**
 * One of {@link development}, {@link docker}, or {@link production} depending on the REACT_APP_STAGE, default to
 * {@link development}.
 */
const config = ((p) => {
    console.log(`evaluating configuration to "${p}"`);

    switch (p) {
        case 'production':
            return production;
        case 'docker':
            return docker;
        case 'development':
            return development;
        default:
            return development;
    }
})((typeof(process) === 'undefined' ? '' : (process.env.REACT_APP_STAGE || '')).toLowerCase());

/**
 * The final configuration merging the default values with the results of {@link config} as overrides on top
 */
export default {
    ...defaults,
    ...config,
} as ConfigType;
