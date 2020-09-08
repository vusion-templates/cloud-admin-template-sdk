"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArrayType = exports.isObjectType = exports.isBodyType = void 0;
exports.isBodyType = (jsonSchema) => Object.keys(jsonSchema).includes('in') &&
    jsonSchema.in === 'body';
exports.isObjectType = (jsonSchema) => !exports.isBodyType(jsonSchema) &&
    (Object.keys(jsonSchema).includes('properties') ||
        jsonSchema.type === 'object');
exports.isArrayType = (jsonSchema) => !exports.isBodyType(jsonSchema) &&
    (Object.keys(jsonSchema).includes('items') || jsonSchema.type === 'array');
