"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    add(viewInfo, project) {
        const { path: pagePath, title, template, page } = viewInfo;
        return [
            function () {
                const pageOP = project.page.load(page);
                return pageOP.view.add(pagePath, {
                    title,
                    template
                });
            },
        ];
    },
    remove(viewInfo, project) {
        const { path: pagePath, title, template, page } = viewInfo;
        return [
            function () {
                const pageOP = project.page.load(page);
                return pageOP.view.remove(pagePath);
            },
        ];
    }
};
