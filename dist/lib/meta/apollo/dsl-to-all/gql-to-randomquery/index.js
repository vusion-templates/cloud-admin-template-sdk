"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var generator_query_1 = require("./generator-query");
Object.defineProperty(exports, "generateRandomQuery", { enumerable: true, get: function () { return generator_query_1.generateRandomQuery; } });
Object.defineProperty(exports, "generateRandomMutation", { enumerable: true, get: function () { return generator_query_1.generateRandomMutation; } });
var provide_variables_1 = require("./provide-variables");
Object.defineProperty(exports, "matchVarName", { enumerable: true, get: function () { return provide_variables_1.matchVarName; } });
Object.defineProperty(exports, "getProvider", { enumerable: true, get: function () { return provide_variables_1.getProvider; } });
Object.defineProperty(exports, "getProviderValue", { enumerable: true, get: function () { return provide_variables_1.getProviderValue; } });
