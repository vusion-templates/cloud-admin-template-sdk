import { ESASTNode } from "../ast-to-resolver";
export declare const RootTemplete = "\nimport requester from './requester';\n\nexport const resolvers = {\n  Query: {\n  },\n};";
/**
 * path = '/xxx/xx/' + args.id
 *
 * query {
 *   start: args.id,
 *   limit: args.id
 * }
 */
export declare const EntityfunTemplate: ({ path, setFlag, query, example }: {
    path: string;
    setFlag?: boolean;
    query: ESASTNode | string;
    example: ESASTNode | string;
}) => string;
/**
 * 查询结构体内部需要补充和完善
 */
export declare const StructureResolverTemplate = "\n  async () => {\n  }\n";
export declare const OtherWebResolverTemplate = "\n  async () => {\n  }\n";
