"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestOptions = void 0;
function getRequestOptions({ method, baseUrl, path, parameterDetails, parameterValues, formData = false, }) {
    const result = {
        method,
        baseUrl,
        path,
        bodyType: formData ? 'formData' : 'json',
    };
    parameterDetails.forEach(({ name, swaggerName, type, required }) => {
        const value = parameterValues[name];
        if (required && !value && value !== '')
            throw new Error(`No required request field ${name} for ${method.toUpperCase()} ${path}`);
        if (!value && value !== '')
            return;
        switch (type) {
            case 'body':
                result.body = value;
                break;
            case 'formData':
                result.body = result.body || {};
                result.body[swaggerName] = value;
                break;
            case 'path':
                result.path =
                    typeof result.path === 'string'
                        ? result.path.replace(`{${swaggerName}}`, value)
                        : result.path;
                break;
            case 'query':
                result.query = result.query || {};
                result.query[swaggerName] = value;
                break;
            case 'header':
                result.headers = result.headers || {};
                result.headers[swaggerName] = value;
                break;
            default:
                throw new Error(`Unsupported param type for param "${name}" and type "${type}"`);
        }
    });
    return result;
}
exports.getRequestOptions = getRequestOptions;
