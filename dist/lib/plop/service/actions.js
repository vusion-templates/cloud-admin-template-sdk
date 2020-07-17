"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    add(serviceInfo, project) {
        const { name } = serviceInfo;
        return [
            function () {
                return project.service.add(name);
            },
        ];
    },
    remove(serviceInfo, project) {
        const { name } = serviceInfo;
        return [
            function () {
                return project.service.remove(name);
            },
        ];
    }
};
