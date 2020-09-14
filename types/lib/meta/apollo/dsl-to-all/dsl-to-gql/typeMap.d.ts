import { GraphQLFieldConfigArgumentMap, GraphQLFieldConfigMap, GraphQLInputFieldConfigMap, GraphQLOutputType, Thunk, GraphQLInputType } from 'graphql';
import { JSONSchemaType } from './json-schema';
import { EndpointParam } from './getRequestOptions';
export declare type GraphQLType = GraphQLOutputType | GraphQLInputType;
export interface GraphQLTypeMap {
    [typeName: string]: GraphQLType;
}
export declare const jsonSchemaTypeToGraphQL: <IsInputType extends boolean>(title: string, jsonSchema: JSONSchemaType, propertyName: string, isInputType: IsInputType, gqlTypes: GraphQLTypeMap, required: boolean) => IsInputType extends true ? GraphQLInputType : GraphQLOutputType;
export declare const getTypeFields: (jsonSchema: JSONSchemaType, title: string, isInputType: boolean, gqlTypes: GraphQLTypeMap) => Thunk<GraphQLInputFieldConfigMap> | Thunk<GraphQLFieldConfigMap<any, any>>;
export declare const createGraphQLType: (jsonSchema: JSONSchemaType | undefined, title: string, isInputType: boolean, gqlTypes: GraphQLTypeMap) => GraphQLType;
export declare const mapParametersToFields: (parameters: EndpointParam[], typeName: string, gqlTypes: GraphQLTypeMap) => GraphQLFieldConfigArgumentMap;
