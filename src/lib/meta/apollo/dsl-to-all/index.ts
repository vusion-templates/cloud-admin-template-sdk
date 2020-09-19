import * as dslToGQL from './dsl-to-gql';
import { printSchema } from 'graphql';
import generator from '@babel/generator'
import { ResolverAST } from './generator/genResolver';

import * as path from 'path';
import { FileSave, OutputGraphQLQueryAndMutation } from './generator/genGraphJS';


export async function TransforDSL(dslSchema: any, rootPath: string) {
  try {
    // define path
    const schemaPath = path.join(rootPath, '/schema.gql');
    const resolverPath = path.join(rootPath, '/resolver.js');

    const { schema, endpoints }  = await dslToGQL.createSchema({
      dslSchema
    });

    // output schema
    FileSave(printSchema(schema), schemaPath)

    // output query gql & graph.js
    OutputGraphQLQueryAndMutation(schema, rootPath);

    // output resolver.js
    const resolverAst: any = await ResolverAST(endpoints);
    const result = generator(resolverAst).code;
    FileSave(`${result}`, resolverPath);

  } catch (err) {
    console.error(err);
  }
}
