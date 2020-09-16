"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDefaults() {
    const defaults = {
        type: '',
        mode: '',
        configPath: '',
        packagePath: '',
        outputPath: '',
        publicPath: '',
        staticPath: '',
        srcPath: './src',
        libraryPath: '',
        baseCSSPath: '',
        rootViewType: 'root',
        theme: undefined,
        applyTheme: false,
        docs: false,
        designer: false,
        forceShaking: false,
        experimental: false,
        ui: {
            name: '',
            version: '',
        },
    };
    return defaults;
}
exports.default = getDefaults;
