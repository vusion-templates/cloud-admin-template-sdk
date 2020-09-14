"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultArgValue = void 0;
function getDefaultArgValue(type) {
    if (type.kind === 'NamedType') {
        if (type.name.value === 'Int') {
            return 10;
        }
        else if (type.name.value === 'Float') {
            return 10.0;
        }
        else if (type.name.value === 'Boolean') {
            return true;
        }
        else {
            // Case: String, ID, or custom scalar:
            return 'PLACEHOLDER';
        }
    }
    else if (type.kind === 'NonNullType') {
        return getDefaultArgValue(type.type);
    }
    else if (type.kind === 'ListType') {
        return [getDefaultArgValue(type.type)];
    }
}
exports.getDefaultArgValue = getDefaultArgValue;
