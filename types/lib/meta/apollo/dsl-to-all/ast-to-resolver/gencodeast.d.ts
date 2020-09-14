import * as acorn from 'acorn';
import { ResolverOptions } from "../dsl-to-gql/interfaceStructure";
/**
 * 要求模版里面只有一个结果值才能找到目标更新
 * 替换请求地址，也可以根据表现层传递过来的参数去配置请求地址
 */
export declare function resolverTemplate(config?: ResolverOptions): any;
export declare const UpdateASTFn: (allEndpoints: any) => Promise<acorn.Node>;
