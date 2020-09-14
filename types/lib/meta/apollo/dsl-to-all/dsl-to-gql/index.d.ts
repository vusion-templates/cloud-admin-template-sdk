import { GraphQLOutputType, GraphQLSchema } from 'graphql';
import { RequestOptions } from './getRequestOptions';
export declare function parseResponse(response: any, returnType: GraphQLOutputType): any;
export { RequestOptions };
export interface CallBackendArguments<TContext> {
    context: TContext;
    requestOptions: RequestOptions;
}
declare type Options<T> = {
    [K: string]: any;
};
export declare const createSchema: <TContext>(options: Options<TContext>) => Promise<{
    schema: GraphQLSchema;
    endpoints: {
        [operaterId: string]: any;
    };
}>;
export default createSchema;
