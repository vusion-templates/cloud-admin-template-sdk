import Project from '../../meta/project';
interface ViewInfo {
    path: string;
    title: string;
    template?: string; // 页面模板，当前先直接使用区块代替
    page: string;
}
export default {
    add(viewInfo: ViewInfo, project: Project): Array<Function|object|string> {
        const { path : pagePath, title, template, page } = viewInfo;
        return [
            function (): void {
                const pageOP = project.page.load(page);
                return pageOP.view.add(pagePath, {
                    title,
                    template
                });
            },
            
        ];
    },
    remove(viewInfo: ViewInfo, project: Project): Array<Function|object|string> {
        const { path : pagePath, title, template, page } = viewInfo;
        return [
            function (): void {
                const pageOP = project.page.load(page);
                return pageOP.view.remove(pagePath);
            },
        ];
    }
}