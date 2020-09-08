import { GraphQLOutputType, GraphQLSchema } from 'graphql';
import { RequestOptions } from './getRequestOptions';
export declare function parseResponse(response: any, returnType: GraphQLOutputType): any;
export { RequestOptions };
export interface CallBackendArguments<TContext> {
    context: TContext;
    requestOptions: RequestOptions;
}
export interface Options<TContext> {
    dslSchema: string;
    callBackend: (args: CallBackendArguments<TContext>) => Promise<any>;
}
export declare const createSchema: <TContext>(options: Options<TContext>) => Promise<GraphQLSchema>;
export default createSchema;
