import * as dslToGQL from './dsl-to-gql';
import { printSchema } from 'graphql';
import { generate, UpdateAST } from './ast-to-resolver';
import * as path from 'path';
import { FileSave, OutputGraphQLQuery } from './generator';


export async function TransforDSL(dslSchema: any, rootPath: string) {
  try {
    // define path
    const schemaPath = path.join(rootPath, '/schema.gql');
    const resolverPath = path.join(rootPath, '/resolver.js');

    console.info('json', dslSchema);

    const { schema, endpoints }  = await dslToGQL.createSchema({
      dslSchema
    });

    // output schema
    FileSave(printSchema(schema), schemaPath)

    // output query gql
    OutputGraphQLQuery(schema, rootPath);

    // output resolver.js
    const astResult: any = await UpdateAST(endpoints);
    const result = generate(astResult);
    FileSave(`${result}`, resolverPath);

  } catch (err) {
    console.error(err);
  }
}
