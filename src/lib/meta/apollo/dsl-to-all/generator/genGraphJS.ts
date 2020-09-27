import { generateQueryByField } from "../gql-to-randomquery";
import { buildSchema, printSchema, print, GraphQLSchema } from "graphql";
import * as fs from "fs-extra";
import * as path from "path";
import generator from "@babel/generator";

export function FileSave(context: any, path: string) {
  fs.ensureFileSync(path);
  fs.writeFileSync(path, context);
}

export function GeneratorGraphTS(groupQueryObject: { [field: string]: any }) {
  const graphAST: any = {
    type: "Program",
    body: [],
  };

  const importAst = {
    type: "ImportDeclaration",
    specifiers: [
      {
        type: "ImportDefaultSpecifier",
        local: {
          type: "Identifier",
          name: "gql",
        },
      },
    ],
    source: {
      type: "StringLiteral",
      value: "graphql-tag",
    },
  };
  graphAST.body.push(importAst);

  const newLocal: any[] = [];
  const exportAst = {
    type: "ExportNamedDeclaration",
    declaration: {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: "graph",
          },
          init: {
            type: "ObjectExpression",
            properties: newLocal,
          },
        },
      ],
      kind: "const",
    },
  };

  Object.keys(groupQueryObject).forEach((key) => {
    const { queryDocument } = groupQueryObject[key];
    exportAst.declaration.declarations[0].init.properties.push({
      type: "ObjectProperty",
      key: {
        type: "Identifier",
        name: key,
      },
      value: {
        type: "TaggedTemplateExpression",
        tag: {
          type: "Identifier",
          name: "gql",
        },
        quasi: {
          type: "TemplateLiteral",
          quasis: [
            {
              type: "TemplateElement",
              value: {
                raw: print(queryDocument),
              },
            },
          ],
        },
      },
    });
  });

  graphAST.body.push(exportAst);
  return generator(graphAST).code;
}

export function OutputGraphQLQueryAndMutation(
  schema: GraphQLSchema,
  rootPath: string
) {
  const groupQueryObject = generateQueryByField(
    buildSchema(`${printSchema(schema)}`)
  );

  // const groupMutationObject = generateMutationByField(
  //   buildSchema(`${printSchema(schema)}`)
  // );

  const graphJS = GeneratorGraphTS({
    ...groupQueryObject,
    // ...groupMutationObject,
  });
  const graphJSPath = path.join(rootPath, `/graph.js`);
  FileSave(graphJS, graphJSPath);
}
