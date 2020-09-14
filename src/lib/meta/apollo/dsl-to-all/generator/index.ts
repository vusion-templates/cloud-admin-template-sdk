
import { generateQueryByField } from '../gql-to-randomquery';
import { buildSchema, printSchema, print, GraphQLSchema } from 'graphql';
import * as fs from 'fs-extra';
import * as path from 'path';
import { generate } from '../ast-to-resolver';

export function FileSave(context: any, path: string) {
  fs.ensureFileSync(path);
  fs.writeFileSync(path, context);
}

export function GeneratorGraphTS(keys: string[] = []) {
  const graphAST: {
    type: string;
    body: any[];
  } = {
    type: 'Program',
    body: []
  };

  keys.forEach(key => {
    graphAST.body.push(
      {
        type: 'ImportDeclaration',
        specifiers: [
          {
            type: 'ImportDefaultSpecifier',
            local: {
              type: 'Identifier',
              name: key,
            }
          }
        ],
        source: {
          type: 'Literal',
          value: `./${key}.gql`
        }
      }
    )
  })

  const newLocal: any[] = [];
  const exportAst =  {
    type: 'ExportNamedDeclaration',
    declaration: {
      type: 'VariableDeclaration',
      declarations: [{
        type: 'VariableDeclarator',
        id: {
          type: "Identifier",
          name: 'graph'
        },
        init: {
          type: 'ObjectExpression',
          properties: newLocal
        },
        
      }],
      kind: 'const'
    }
  };

  keys.forEach(key => {
    exportAst.declaration.declarations[0].init.properties.push( {
      type: 'Property',
      key: {
        type: 'Identifier',
        name: key
      },
      value: {
        type: 'Identifier',
        name: key
      }
    })

  })

  graphAST.body.push(exportAst);

  return generate(graphAST);
}

export function OutputGraphQLQuery(schema: GraphQLSchema, rootPath: string) {
  const groupQueryObject= generateQueryByField(
    buildSchema(`${printSchema(schema)}`),
  );

  Object.keys(groupQueryObject).forEach((fieldName: string) => {
    const { queryDocument, variableValues }  = groupQueryObject[fieldName];
    const queryPath = path.join(rootPath, `/${fieldName}.gql`);
    // output query
    FileSave(print(queryDocument), queryPath);
  })

   const graphJS = GeneratorGraphTS(Object.keys(groupQueryObject));
   const graphJSPath = path.join(rootPath, `/graph.js`);
   FileSave(graphJS, graphJSPath)
}
