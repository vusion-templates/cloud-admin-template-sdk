"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tansform_1 = require("../ast-to-resolver/tansform");
function Test(path) {
    const result = tansform_1.PathToBinaryExpressionString(path);
    console.info('result', result);
}
Test("asdfaf{as}");
Test("asdfaf");
Test("");
