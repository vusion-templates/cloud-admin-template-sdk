import { 
	NameNode, 
	TypeNode, 
	Location, 
	Kind, 
	ArgumentNode, 
	FieldDefinitionNode,
	GraphQLObjectType,
	GraphQLNamedType,
	GraphQLSchema
 } from "graphql"


// Default location
export const loc: Location = {
  start: 0,
  end: 0,
  startToken: null,
  endToken: null,
  source: null,
  toJSON: (): { start: number; end: number} => { return { start: this.start, end: this.end }; }
}

export function isMandatoryType(type: TypeNode): boolean {
  return type.kind === Kind.NON_NULL_TYPE
}

export function getName(name: string): NameNode {
  return {
    kind: Kind.NAME,
    value: name
  }
}

export function getVariable(argName: string, varName: string): ArgumentNode {
  return {
    kind: Kind.ARGUMENT,
    loc,
    name: getName(argName),
    value: {
      kind: Kind.VARIABLE,
      name: getName(varName)
    }
  }
}

export function getNextNodefactor(variableValues: { [name: string]: any }): number {
  if (typeof variableValues['first'] === 'number') {
    variableValues['first']
  }
  return 1
}

export type Variables = { [varName: string]: any }


export type ProviderFunction = (
  variables: Variables,
  argType?: GraphQLNamedType
) =>
  | any // For type__field__argument providers
  | { [argumentName: string]: any } // For type__field providers

export type ProviderMap = {
  [varNameQuery: string]: any | ProviderFunction;
}

export type Configuration = {
  depthProbability?: number | ((depth: number) => number);
  breadthProbability?: number | ((depth: number) => number);
  maxDepth?: number;
  ignoreOptionalArguments?: boolean;
  argumentsToIgnore?: string[];
  argumentsToConsider?: string[];
  providerMap?: ProviderMap;
  considerInterfaces?: boolean;
  considerUnions?: boolean;
  seed?: number;
  pickNestedQueryField?: boolean;
  providePlaceholders?: boolean;
}

export type InternalConfiguration = Configuration & {
  seed: number;
  nextSeed?: number;
  nodeFactor: number;
  typeCount: number;
  resolveCount: number;
}

export function getTypeName(type: TypeNode): string {
  if (type.kind === Kind.NAMED_TYPE) {
    return type.name.value
  } else if (type.kind === Kind.LIST_TYPE) {
    return getTypeName(type.type)
  } else if (type.kind === Kind.NON_NULL_TYPE) {
    return getTypeName(type.type)
  } else {
    throw new Error(`Cannot get name of type: ${type}`)
  }
}

export function random(config: InternalConfiguration) {
	return config.nextSeed || config.seed;
}

function isObjectField(
  field: FieldDefinitionNode,
  schema: GraphQLSchema
): boolean {
  const ast = schema.getType(getTypeName(field.type)).astNode
  return typeof ast !== 'undefined' && ast.kind === Kind.OBJECT_TYPE_DEFINITION
}

function isInterfaceField(
  field: FieldDefinitionNode,
  schema: GraphQLSchema
): boolean {
  const ast = schema.getType(getTypeName(field.type)).astNode
  return (
    typeof ast !== 'undefined' && ast.kind === Kind.INTERFACE_TYPE_DEFINITION
  )
}

function isUnionField(
  field: FieldDefinitionNode,
  schema: GraphQLSchema
): boolean {
  const ast = schema.getType(getTypeName(field.type)).astNode
  return typeof ast !== 'undefined' && ast.kind === Kind.UNION_TYPE_DEFINITION
}

function getTypeNameMetaFieldDef(): FieldDefinitionNode {
  return {
    name: {
      kind: 'Name',
      value: '__typename'
    },
    kind: 'FieldDefinition',
    type: {
      kind: 'NonNullType',
      type: {
        kind: 'NamedType',
        name: {
          kind: 'Name',
          value: 'String'
        }
      }
    }
  }
}

function fieldHasLeafs(
  field: FieldDefinitionNode,
  schema: GraphQLSchema
): boolean {
  const ast = schema.getType(getTypeName(field.type)).astNode
  if (
    ast.kind === Kind.OBJECT_TYPE_DEFINITION ||
    ast.kind === Kind.INTERFACE_TYPE_DEFINITION
  ) {
    return ast.fields.some((child) => {
      const childAst = schema.getType(getTypeName(child.type)).astNode
      return (
        typeof childAst === 'undefined' ||
        childAst.kind === Kind.SCALAR_TYPE_DEFINITION
      )
    })
  } else if (ast.kind === Kind.UNION_TYPE_DEFINITION) {
    return ast.types.some((child) => {
      const unionNamedTypes = (schema.getType(
        child.name.value
      ) as GraphQLObjectType).astNode.fields

      return unionNamedTypes.some((child) => {
        const childAst = schema.getType(getTypeName(child.type)).astNode
        return (
          typeof childAst === 'undefined' ||
          childAst.kind === Kind.SCALAR_TYPE_DEFINITION
        )
      })
    })
  }

  return false
}

export function getRandomFields(
  fields: ReadonlyArray<FieldDefinitionNode>,
  config: InternalConfiguration,
  schema: GraphQLSchema,
  depth: number
): ReadonlyArray<FieldDefinitionNode> {
  const results = []

  // Create lists of nested and flat fields to pick from
  let nested
  let flat
  if (config.considerInterfaces && config.considerUnions) {
    nested = fields.filter((field) => {
      return (
        isObjectField(field, schema) ||
        isInterfaceField(field, schema) ||
        isUnionField(field, schema)
      )
    })

    flat = fields.filter((field) => {
      return !(
        isObjectField(field, schema) ||
        isInterfaceField(field, schema) ||
        isUnionField(field, schema)
      )
    })
  } else if (config.considerInterfaces! && config.considerUnions) {
    fields = fields.filter((field) => {
      return !isInterfaceField(field, schema)
    })

    nested = fields.filter((field) => {
      return isObjectField(field, schema) || isUnionField(field, schema)
    })

    flat = fields.filter((field) => {
      return !(isObjectField(field, schema) || isUnionField(field, schema))
    })
  } else if (config.considerInterfaces && config.considerUnions!) {
    fields = fields.filter((field) => {
      return !isUnionField(field, schema)
    })

    nested = fields.filter((field) => {
      return isObjectField(field, schema) || isInterfaceField(field, schema)
    })

    flat = fields.filter((field) => {
      return !(isObjectField(field, schema) || isInterfaceField(field, schema))
    })
  } else {
    fields = fields.filter((field) => {
      return !(isInterfaceField(field, schema) || isUnionField(field, schema))
    })

    nested = fields.filter((field) => {
      return isObjectField(field, schema)
    })

    flat = fields.filter((field) => {
      return !isObjectField(field, schema)
    })
  }

  // Filter out fields that only have nested subfields
  if (depth + 2 === config.maxDepth) {
    nested = nested.filter((field) => fieldHasLeafs(field, schema))
  }
  const nextIsLeaf = depth + 1 === config.maxDepth

  const pickNested =
    typeof config.depthProbability === 'number'
      ? random(config) <= config.depthProbability
      : random(config) <= config.depthProbability(depth)

  // If we decide to pick nested, choose one nested field (if one exists)...
  if (
    (pickNested && nested.length > 0 && !nextIsLeaf) ||
    (depth === 0 && config.pickNestedQueryField)
  ) {
    const nestedIndex = Math.floor(random(config) * nested.length)
    results.push(nested[nestedIndex])
    nested.splice(nestedIndex, 1)

    // ...and possibly choose more
    nested.forEach((field) => {
      const pickNested =
        typeof config.breadthProbability === 'number'
          ? random(config) <= config.breadthProbability
          : random(config) <= config.breadthProbability(depth)
      if (pickNested) {
        results.push(field)
      }
    })
  }

  // Pick flat fields based on the breadth probability
  flat.forEach((field) => {
    const pickFlat =
      typeof config.breadthProbability === 'number'
        ? random(config) <= config.breadthProbability
        : random(config) <= config.breadthProbability(depth)
    if (pickFlat) {
      results.push(field)
    }
  })

  // Ensure to pick at least one field
  if (results.length === 0) {
    // If the next level is not the last, we can choose ANY field
    if (!nextIsLeaf) {
      const forcedIndex = Math.floor(random(config) * fields.length)
      results.push(fields[forcedIndex])
      // ...otherwise, we HAVE TO choose a flat field:
    } else if (flat.length > 0) {
      const forcedFlatIndex = Math.floor(random(config) * flat.length)
      results.push(flat[forcedFlatIndex])
    } else {
      // default to selecting __typename meta field:
      results.push(getTypeNameMetaFieldDef())
    }
  }

  return results
}
