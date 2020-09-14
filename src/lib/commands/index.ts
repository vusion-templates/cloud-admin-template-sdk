import Project from '../meta/project';
import View, { ViewOptions } from '../meta/view';
import { BlockInfo, ViewInfo } from '../meta/view';
import { AddPage, RemovePage } from '../meta/page';
import { ApolloOP } from '../meta/project/apollo';

export interface Command {
    [prop: string]: any;
}
export default function (root: string): Command {
    const project = new Project(root);
    
    return {
        'config.resolve'() {
            return project.config();
        },
        'page.list'() {
            return project.page.loadList();
        },
        'page.add'(answers: AddPage) {
            return project.page.add(answers);
        },
        'page.remove'(answers: RemovePage) {
        },
        // 获取到传入到参数
        'apollo.update'(json: JSON): ReturnType<ApolloOP['updateApollo']> {
          return project.apollo.updateApollo(json);
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
        },
        'service.add': function(...args) {
            return project.service.add(...args);
        } as typeof project.service.add,

        'service.remove': function(...args) {
            return project.service.remove(...args);
        } as typeof project.service.remove,

        'view.list'(pageName: string) {
            return project.page.load(pageName).view.loadList();
        },
        'view.subList'(pageName: string, viewPath: string) {
            return project.page.load(pageName).view.loadSubList(viewPath);
        },
        'view.tree'(pageName: string) {
            return project.page.load(pageName).view.loadTree();
        },
        'view.add': function (pageName: string, viewPath: string, options?: ViewOptions) {
            return project.page.load(pageName).view.add(viewPath, options);
        },
        'view.remove': function (pageName: string, viewPath: string) {
            return project.page.load(pageName).view.remove(viewPath);
        },
        'view.detail': async function (pageName: string, viewPath: string) {
            return await project.page.load(pageName).view.load(viewPath).getContent();
        },
        'view.vueFile': async function (pageName: string, viewPath: string) {
            return await project.page.load(pageName).view.load(viewPath).loadVueFile();
        },
        'view.savePartialCode': async function (pageName: string, viewPath: string, type: 'template' | 'script' | 'style' | 'definition', content: string) {
            return await project.page.load(pageName).view.load(viewPath).savePartialCode(type, content);
        },
        'view.mergeCode': async function (pageName: string, viewPath: string, code: string, nodePath: string): ReturnType<View["mergeCode"]> {
            return await project.page.load(pageName).view.load(viewPath).mergeCode(code, nodePath);
        },
        'view.addBlock': async function (pageName: string, viewPath: string, blockInfo: BlockInfo): ReturnType<View["addBlock"]> {
            return await project.page.load(pageName).view.load(viewPath).addBlock(blockInfo);
        },
        'view.addCustomComponent': async function (pageName: string, viewPath: string, blockInfo: BlockInfo, content: string): ReturnType<View["addCustomComponent"]> {
            return await project.page.load(pageName).view.load(viewPath).addCustomComponent(blockInfo, content);
        },
    };
}