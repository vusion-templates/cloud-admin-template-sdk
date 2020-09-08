import { GraphQLNamedType, TypeNode } from 'graphql';
import { Configuration, ProviderMap, ProviderFunction, Variables } from './tools';
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
