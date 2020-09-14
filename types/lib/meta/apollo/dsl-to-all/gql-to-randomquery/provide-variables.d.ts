import { GraphQLNamedType, TypeNode } from 'graphql';
import { Configuration } from './generator-query';
declare type Variables = {
    [varName: string]: any;
};
export declare type ProviderFunction = (variables: Variables, argType?: GraphQLNamedType) => any | {
    [argumentName: string]: any;
};
export declare type ProviderMap = {
    [varNameQuery: string]: any | ProviderFunction;
};
export declare function matchVarName(query: string, candidates: string[]): string;
export declare function getProvider(varName: string, providerMap: ProviderMap): {
    providerFound: boolean;
    provider: any | ProviderFunction;
};
export declare function getRandomEnum(type: GraphQLNamedType): string;
export declare function isEnumType(type: GraphQLNamedType): boolean;
export declare function getProviderValue(varName: string, config: Configuration, providedValues: Variables, argType?: GraphQLNamedType): {
    providerFound: boolean;
    value: any;
};
export declare function getDefaultArgValue(type: TypeNode): any;
export {};
