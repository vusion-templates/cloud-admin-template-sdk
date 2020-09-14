import { DSLSchema } from "./dsl-to-gql/confg";
import * as dslToGQL from './dsl-to-gql';
import { generateRandomQuery } from './gql-to-randomquery';
import { buildSchema, printSchema, print } from 'graphql';
import * as fs from 'fs';
import { generate, UpdateAST } from './ast-to-resolver';
import * as acorn from 'acorn';
import * as path from 'path';


export async function TransforDSL(dslSchema: any, rootPath: string) {
	try {
	// 	const rootPath = '/Users/daisy/wy/vue-cli/gqlclient/src';
		const schema = await dslToGQL.createSchema({
			dslSchema
		});
		// output schema
		await fs.writeFileSync(path.join(rootPath, '/schema.gql'), printSchema(schema));
		
		// output query
		const configuration = {
			depthProbability: 1,
			breadthProbability: 1,
			ignoreOptionalArguments: false,
			providePlaceholders: true
		}

		const { queryDocument, variableValues, seed } = generateRandomQuery(
			buildSchema(`${printSchema(schema)}`),
			configuration
		);

		fs.writeFile(path.join(rootPath, '/client.gql'), print(queryDocument), () => {
			console.info("Successful transfer client");
		});


		// output resolver
		const ast = acorn.parse(`const resolvers = {
			Query: {
			},
		};`);
		const astResult = await UpdateAST(ast, dslSchema);
		
		const result = generate(astResult);

		fs.writeFile(path.join(rootPath, '/resolver.js'), `export ${result}`, () => {
			console.info("Successful output resolver");
		});

	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}