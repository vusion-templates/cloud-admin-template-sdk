export declare const RootTemplete = "\nimport requester from './requester';\n\nexport const resolvers = {\n\tQuery: {\n\t},\n};";
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
export declare const StructureResolverTemplate = "\n\tasync () => {\n\t}\n";
export declare const OtherWebResolverTemplate = "\n\tasync () => {\n\t}\n";
