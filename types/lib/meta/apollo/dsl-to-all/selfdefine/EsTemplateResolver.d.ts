export declare const RootTemplete = "\nimport requester from './requester';\n\nexport const resolvers = {\n  Query: {\n  },\n};";
/**
 * path = '/xxx/xx/' + args.id
 *
 * query {
 *   start: args.id,
 *   limit: args.id
 * }
 */
export declare const EntityfunTemplate: ({ path, setFlag, query }: {
    path: string;
    setFlag?: boolean;
    query: object;
}) => string;
/**
 * 查询结构体内部需要补充和完善
 */
export declare const StructureResolverTemplate = "\n  async () => {\n  }\n";
export declare const OtherWebResolverTemplate = "\n  async () => {\n  }\n";
