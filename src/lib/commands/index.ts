import Project from '../meta/project';
import type { PageOP } from '../meta/project/page';
import type { ViewOP } from '../meta/page/view';
import type { ServiceOP } from '../meta/project/service';
import type View from '../meta/view';
import { addBlock, addCode, addLayout } from 'vusion-api/out/designer';

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

        'block.add': async function(...args) {
            return await addBlock(...args);
        } as typeof addBlock,
        'code.add': async function (...args) {
            return await addCode(...args);
        } as typeof addCode,
        'layout.add': async function (...args) {
            return await addLayout(...args);
        } as typeof addLayout,
    };
}