import Project from '../meta/project';
import type { PageOP } from '../meta/project/page';
import type { ViewOP } from '../meta/page/view';
import type { ServiceOP } from '../meta/project/service';
import type View from '../meta/view';
import { addCode, addLayout } from 'vusion-api/out/designer';
import type { BlockInfo } from '../meta/view';

export interface Command {
    [prop: string]: any;
}
export default function (root: string): Command {
    const project = new Project(root);
    return {
        'config.resolve': function () {
            return project.config();
        } as Project["config"],

        'page.add'(answers): ReturnType<PageOP["add"]> {
            return project.page.add(answers);
        },

        'page.remove'(answers): ReturnType<PageOP["remove"]> {
            return project.page.remove(answers);
        },

        'auth.load': function () {
            return project.auth.load();
        } as Project["auth"]["load"],

        'auth.saveItem': function (...args) {
            return project.auth.addItem(...args);
        } as Project["auth"]["addItem"],

        'auth.removeItem': function (...args) {
            return project.auth.removeItem(...args);
        } as Project["auth"]["removeItem"],

        'client.package': function () {
            return project.getPackage();
        } as Project["getPackage"],

        'component.module.list': async function (...args) {
            return await project.loadDeps(...args);
        } as Project["loadDeps"],

        'component.module': async function (...args) {
            return await project.loadDep(...args);
        } as Project["loadDep"],

        'ui.library': async function (...args) {
            return await project.loadUILibrary(...args);
        } as Project["loadUILibrary"],

        'service.list': function() {
            return project.service.loadListPath();
        } as ServiceOP["loadListPath"],

        'service.add': function(...args) {
            return project.service.add(...args);
        } as ServiceOP["add"],

        'service.remove': function(...args) {
            return project.service.remove(...args);
        } as ServiceOP["remove"],

        'view.list'(page: string): ReturnType<ViewOP["loadListPath"]> {
            return project.page.load(page).view.loadListPath();
        },
        'view.add': function (page: string, view: string, options) {
            return project.page.load(page).view.add(view, options);
        } as typeof View.addView, 
     
        'view.remove': function (page: string, view: string) {
            return project.page.load(page).view.remove(view);
        } as typeof View.removeView,
        'view.detail': function (page: string, view: string) {
            return project.page.load(page).view.load(view).getContent();
        } as View["getContent"],

        'view.mergeCode': function (page: string, view: string, code: string, nodePath: string) {
            return project.page.load(page).view.mergeCode(view, code, nodePath);
        } as typeof View.mergeCode,
        'view.saveCode': function (page: string, view: string, type: string, content: string) {
            return project.page.load(page).view.saveCode(view, type, content);
        } as typeof View.saveCode,
        'view.addBlock': function (page: string, view: string, blockInfo: BlockInfo) {
            return project.page.load(page).view.addBlock(view, blockInfo);
        } as typeof View.addBlock,
        'view.addCustomComponent': function (page: string, view: string, libraryPath: string, blockInfo: BlockInfo, content: string) {
            return project.page.load(page).view.addCustomComponent(view, libraryPath, blockInfo, content);
        } as typeof View.addCustomComponent,
    };
}