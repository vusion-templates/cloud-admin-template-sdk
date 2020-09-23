

const { TransforDSL } = require("../dist/lib/meta/apollo/dsl-to-all/index");

/**
 * 用自定义的结构测试转化工具
 * 
 * yarn codegen  --dsl-schema=entityResolver.json
 */
require('yargs')
.scriptName('dsl-test')
.command(
	'$0',
	'Convert swagger schema to graphql schema',
	(yargs) => {
		yargs.options('dsl-schema', {
			describe: 'Path or url to a swagger schema, can be json or yaml',
			type: 'string',
			demandOption: true,
		});
	},
	async ({ dslSchema }) => {
		try {

			await TransforDSL(dslSchema, '/Users/daisy/wy/cloud-admin-template/src/global/apollo');
			
		} catch (err) {
			console.error(err);
			process.exit(1);
		}
	},
)
.help().argv;