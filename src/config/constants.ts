// @ts-ignore - package.json không có type definitions
const packageJson = require('../../package.json');

export const APP_VERSION = packageJson.version;

