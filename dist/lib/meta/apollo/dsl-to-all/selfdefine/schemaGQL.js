"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateListSchemaOfEntity = void 0;
/**
 *
 * 实体的 schema 需要包含部分自定义的处理
 */
function UpdateListSchemaOfEntity(schema) {
    if (schema.type === 'array') {
        const temp = schema;
        return {
            type: 'object',
            properties: {
                content: temp,
                totalElements: {
                    type: "integer",
                    format: "int"
                }
            }
        };
    }
    return schema;
}
exports.UpdateListSchemaOfEntity = UpdateListSchemaOfEntity;
