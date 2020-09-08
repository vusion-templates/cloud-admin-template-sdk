import { DocumentNode, GraphQLSchema } from 'graphql';
import { Configuration } from './tools';
export declare function generateRandomMutation(schema: GraphQLSchema, config?: Configuration): {
    mutationDocument: DocumentNode;
    variableValues: {
        [varName: string]: any;
    };
    seed: number;
    typeCount: number;
    resolveCount: number;
};
export declare function generateRandomQuery(schema: GraphQLSchema, config?: Configuration): {
    queryDocument: DocumentNode;
    variableValues: {
        [varName: string]: any;
    };
    seed: number;
    typeCount: number;
    resolveCount: number;
};
