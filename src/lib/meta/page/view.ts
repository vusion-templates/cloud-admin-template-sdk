import * as path from 'path';
import View  from '../view';
import type { ViewOptions, BlockInfo, ViewInfo } from '../view';
export interface ViewOP {
    loadListPath(): ReturnType<typeof View.getViewsPath>;
    load(viewPath: string): View;
    remove(view: string): ReturnType<typeof View.removeView>;
    add(view: string, options?: ViewOptions): ReturnType<typeof View.addView>;
    mergeCode(view: string, code: string, nodePath: string): ReturnType<typeof View.mergeCode>;
    saveCode(view: string, type: string, content: string): ReturnType<typeof View.saveCode>;
    addBlock(view: string, blockInfo: BlockInfo): ReturnType<typeof View.saveCode>;
    addCustomComponent(view: string, blockInfo: BlockInfo, content: string): ReturnType<typeof View.addCustomComponent>;
    getViewContent(view: string, viewInfo: ViewInfo): ReturnType<typeof View.addCustomComponent>;
}
const getRootPath = function (root: string): string {
    return path.join(root, 'views');
}
export default function(pageRoot: string): ViewOP{
    const root = getRootPath(pageRoot);
    return {
        loadListPath(){
            return View.getViewsPath(root);
        },
        load(viewPath) {
            return new View(viewPath, root, this);
        },
        remove(view) {
            return View.removeView(root, view);
        },
        add(view, options) {
            return View.addView(root, view, options);
        },
        mergeCode(view, code, nodePath) {
            return View.mergeCode(root, view, code, nodePath);
        },
        saveCode(view, type, content) {
            return View.saveCode(root, view, type, content);
        },
        addBlock(view, blockInfo) {
            return View.addBlock(root, view, blockInfo);
        },
        addCustomComponent(view, blockInfo, content) {
            return View.addCustomComponent(root, view, blockInfo, content);
        },
        getViewContent(view, viewInfo) {
            return View.getViewContent(root, view, viewInfo);
        },
    } as ViewOP;
}