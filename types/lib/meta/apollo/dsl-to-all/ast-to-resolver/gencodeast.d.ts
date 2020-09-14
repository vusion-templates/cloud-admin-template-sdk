import { ResolverOptions } from "../dsl-to-gql/interfaceStructure";
/**
 * 要求模版里面只有一个结果值才能找到目标更新
 * 替换请求地址，也可以根据表现层传递过来的参数去配置请求地址
 */
export declare function resolverTemplate(config: ResolverOptions): any;
export declare const UpdateASTFn: (ast: any, dslSchema: any) => Promise<any>;
/**
 *  parse await function, append to page
 * const ast = acorn.parse(`const resolvers = {
        Query: {
        },
    };`);

    acorn.parse 自动生成通用模版，更新局部参数

    用户配置信息加上常用模版共同组合成 resolver 函数和之后的的在页面上使用的查询函数

    1. 参加 gencode 的部分代码
    2. 参数自动编辑逻辑的数据结构组装方法
    3.
 */ 
