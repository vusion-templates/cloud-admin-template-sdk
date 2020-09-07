import * as fs from 'fs-extra';
import * as path from 'path';
import { templatePath } from '../../utils';
import { ProjectPath, LEVEL_ENUM } from '../common';
import Tree from '../common/tree';
import File from '../common/file';
import Directory from '../common/directory';
import type Project from '../Project';
import dslToGQL from './dsl-to-gql';
import { generateRandomQuery } from './gql-to-randomquery';
import { buildSchema, printSchema, print } from 'graphql';

export default class Apollo extends Tree implements ProjectPath {
	public subFiles: {
			api: File;
			config: File;
			index: File;
	}
	/**
	 * TODO 
	 * 1. generator resolver
	 * 2. write file to right path
	 *  
	 */
	static updateApollo(root, json: any) {
		// dsl json => schema
		const schema = dslToGQL.createSchema({
			dslSchema: json,
		});

		// output schema
		// cloud-admin-template/src/global/apollo/index.gql
		const schemaApi = new File(path.join(root, 'index.gql'));
		schemaApi.save(printSchema(schema));
		
		// schema => full query string
		const configuration = {
			depthProbability: 1,
			breadthProbability: 1,
			ignoreOptionalArguments: false,
			providePlaceholders: true
		}

		const { queryDocument } = generateRandomQuery(
			buildSchema(`${printSchema(schema)}`),
			configuration
		);
		// output query
		// cloud-admin-template/src/views/{test}/index.gql
		const clientApi = new File(path.join(root, 'index.gql'));
		clientApi.save(print(queryDocument));
	}
}