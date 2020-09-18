
import { ArraySchema } from "../dsl-to-gql/json-schema";
/**
 * 
 * 实体的 schema 需要包含部分自定义的处理
 */
export function UpdateListSchemaOfEntity(schema: any) {
  if (schema.type === 'array') {
    const temp: ArraySchema = schema;
<<<<<<< HEAD
    // return {
    //   type: 'object',
    //   properties: {
    //     content: temp,
    //     totalElements: {
    //       type: "integer",
    //       format: "int"
    //     }
    //   }
    // }
    return schema;
=======
    return {
      type: 'object',
      properties: {
        content: temp,
        totalElements: {
          type: "integer",
          format: "int"
        }
      }
    }
>>>>>>> feat: rm dist
  }

  return schema;
}