import { NameNode, TypeNode, Location, ArgumentNode, FieldDefinitionNode, GraphQLNamedType, GraphQLSchema } from "graphql";
export declare const loc: Location;
export declare function isMandatoryType(type: TypeNode): boolean;
export declare function getName(name: string): NameNode;
export declare function getVariable(argName: string, varName: string): ArgumentNode;
export declare function getNextNodefactor(variableValues: {
    [name: string]: any;
}): number;
export declare type Variables = {
    [varName: string]: any;
};
export declare type ProviderFunction = (variables: Variables, argType?: GraphQLNamedType) => any | {
    [argumentName: string]: any;
};
export declare type ProviderMap = {
    [varNameQuery: string]: any | ProviderFunction;
};
export declare type Configuration = {
    depthProbability?: number | ((depth: number) => number);
    breadthProbability?: number | ((depth: number) => number);
    maxDepth?: number;
    ignoreOptionalArguments?: boolean;
    argumentsToIgnore?: string[];
    argumentsToConsider?: string[];
    providerMap?: ProviderMap;
    considerInterfaces?: boolean;
    considerUnions?: boolean;
    seed?: number;
    pickNestedQueryField?: boolean;
    providePlaceholders?: boolean;
};
export declare type InternalConfiguration = Configuration & {
    seed: number;
    nextSeed?: number;
    nodeFactor: number;
    typeCount: number;
    resolveCount: number;
};
export declare function getTypeName(type: TypeNode): string;
export declare function random(config: InternalConfiguration): number;
export declare function getRandomFields(fields: ReadonlyArray<FieldDefinitionNode>, config: InternalConfiguration, schema: GraphQLSchema, depth: number): ReadonlyArray<FieldDefinitionNode>;
