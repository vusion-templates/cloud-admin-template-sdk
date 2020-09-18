import { GraphQLSchema } from 'graphql';
export declare function FileSave(context: any, path: string): void;
export declare function GeneratorGraphTS(groupQueryObject: {
    [field: string]: any;
}): string;
export declare function OutputGraphQLQuery(schema: GraphQLSchema, rootPath: string): void;
