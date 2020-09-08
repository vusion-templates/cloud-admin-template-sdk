"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomFields = exports.random = exports.getTypeName = exports.getNextNodefactor = exports.getVariable = exports.getName = exports.isMandatoryType = exports.loc = void 0;
const graphql_1 = require("graphql");
// Default location
exports.loc = {
    start: 0,
    end: 0,
    startToken: null,
    endToken: null,
    source: null,
    toJSON: () => { return { start: this.start, end: this.end }; }
};
function isMandatoryType(type) {
    return type.kind === graphql_1.Kind.NON_NULL_TYPE;
}
exports.isMandatoryType = isMandatoryType;
function getName(name) {
    return {
        kind: graphql_1.Kind.NAME,
        value: name
    };
}
exports.getName = getName;
function getVariable(argName, varName) {
    return {
        kind: graphql_1.Kind.ARGUMENT,
        loc: exports.loc,
        name: getName(argName),
        value: {
            kind: graphql_1.Kind.VARIABLE,
            name: getName(varName)
        }
    };
}
exports.getVariable = getVariable;
function getNextNodefactor(variableValues) {
    if (typeof variableValues['first'] === 'number') {
        variableValues['first'];
    }
    return 1;
}
exports.getNextNodefactor = getNextNodefactor;
function getTypeName(type) {
    if (type.kind === graphql_1.Kind.NAMED_TYPE) {
        return type.name.value;
    }
    else if (type.kind === graphql_1.Kind.LIST_TYPE) {
        return getTypeName(type.type);
    }
    else if (type.kind === graphql_1.Kind.NON_NULL_TYPE) {
        return getTypeName(type.type);
    }
    else {
        throw new Error(`Cannot get name of type: ${type}`);
    }
}
exports.getTypeName = getTypeName;
function random(config) {
    return config.nextSeed || config.seed;
}
exports.random = random;
function isObjectField(field, schema) {
    const ast = schema.getType(getTypeName(field.type)).astNode;
    return typeof ast !== 'undefined' && ast.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION;
}
function isInterfaceField(field, schema) {
    const ast = schema.getType(getTypeName(field.type)).astNode;
    return (typeof ast !== 'undefined' && ast.kind === graphql_1.Kind.INTERFACE_TYPE_DEFINITION);
}
function isUnionField(field, schema) {
    const ast = schema.getType(getTypeName(field.type)).astNode;
    return typeof ast !== 'undefined' && ast.kind === graphql_1.Kind.UNION_TYPE_DEFINITION;
}
function getTypeNameMetaFieldDef() {
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
    };
}
function fieldHasLeafs(field, schema) {
    const ast = schema.getType(getTypeName(field.type)).astNode;
    if (ast.kind === graphql_1.Kind.OBJECT_TYPE_DEFINITION ||
        ast.kind === graphql_1.Kind.INTERFACE_TYPE_DEFINITION) {
        return ast.fields.some((child) => {
            const childAst = schema.getType(getTypeName(child.type)).astNode;
            return (typeof childAst === 'undefined' ||
                childAst.kind === graphql_1.Kind.SCALAR_TYPE_DEFINITION);
        });
    }
    else if (ast.kind === graphql_1.Kind.UNION_TYPE_DEFINITION) {
        return ast.types.some((child) => {
            const unionNamedTypes = schema.getType(child.name.value).astNode.fields;
            return unionNamedTypes.some((child) => {
                const childAst = schema.getType(getTypeName(child.type)).astNode;
                return (typeof childAst === 'undefined' ||
                    childAst.kind === graphql_1.Kind.SCALAR_TYPE_DEFINITION);
            });
        });
    }
    return false;
}
function getRandomFields(fields, config, schema, depth) {
    const results = [];
    // Create lists of nested and flat fields to pick from
    let nested;
    let flat;
    if (config.considerInterfaces && config.considerUnions) {
        nested = fields.filter((field) => {
            return (isObjectField(field, schema) ||
                isInterfaceField(field, schema) ||
                isUnionField(field, schema));
        });
        flat = fields.filter((field) => {
            return !(isObjectField(field, schema) ||
                isInterfaceField(field, schema) ||
                isUnionField(field, schema));
        });
    }
    else if (config.considerInterfaces && config.considerUnions) {
        fields = fields.filter((field) => {
            return !isInterfaceField(field, schema);
        });
        nested = fields.filter((field) => {
            return isObjectField(field, schema) || isUnionField(field, schema);
        });
        flat = fields.filter((field) => {
            return !(isObjectField(field, schema) || isUnionField(field, schema));
        });
    }
    else if (config.considerInterfaces && config.considerUnions) {
        fields = fields.filter((field) => {
            return !isUnionField(field, schema);
        });
        nested = fields.filter((field) => {
            return isObjectField(field, schema) || isInterfaceField(field, schema);
        });
        flat = fields.filter((field) => {
            return !(isObjectField(field, schema) || isInterfaceField(field, schema));
        });
    }
    else {
        fields = fields.filter((field) => {
            return !(isInterfaceField(field, schema) || isUnionField(field, schema));
        });
        nested = fields.filter((field) => {
            return isObjectField(field, schema);
        });
        flat = fields.filter((field) => {
            return !isObjectField(field, schema);
        });
    }
    // Filter out fields that only have nested subfields
    if (depth + 2 === config.maxDepth) {
        nested = nested.filter((field) => fieldHasLeafs(field, schema));
    }
    const nextIsLeaf = depth + 1 === config.maxDepth;
    const pickNested = typeof config.depthProbability === 'number'
        ? random(config) <= config.depthProbability
        : random(config) <= config.depthProbability(depth);
    // If we decide to pick nested, choose one nested field (if one exists)...
    if ((pickNested && nested.length > 0 && !nextIsLeaf) ||
        (depth === 0 && config.pickNestedQueryField)) {
        const nestedIndex = Math.floor(random(config) * nested.length);
        results.push(nested[nestedIndex]);
        nested.splice(nestedIndex, 1);
        // ...and possibly choose more
        nested.forEach((field) => {
            const pickNested = typeof config.breadthProbability === 'number'
                ? random(config) <= config.breadthProbability
                : random(config) <= config.breadthProbability(depth);
            if (pickNested) {
                results.push(field);
            }
        });
    }
    // Pick flat fields based on the breadth probability
    flat.forEach((field) => {
        const pickFlat = typeof config.breadthProbability === 'number'
            ? random(config) <= config.breadthProbability
            : random(config) <= config.breadthProbability(depth);
        if (pickFlat) {
            results.push(field);
        }
    });
    // Ensure to pick at least one field
    if (results.length === 0) {
        // If the next level is not the last, we can choose ANY field
        if (!nextIsLeaf) {
            const forcedIndex = Math.floor(random(config) * fields.length);
            results.push(fields[forcedIndex]);
            // ...otherwise, we HAVE TO choose a flat field:
        }
        else if (flat.length > 0) {
            const forcedFlatIndex = Math.floor(random(config) * flat.length);
            results.push(flat[forcedFlatIndex]);
        }
        else {
            // default to selecting __typename meta field:
            results.push(getTypeNameMetaFieldDef());
        }
    }
    return results;
}
exports.getRandomFields = getRandomFields;
