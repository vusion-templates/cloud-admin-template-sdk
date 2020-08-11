
import { project } from '../global';
import Page from '../../lib/meta/page';
import { LEVEL_ENUM } from '../../lib/meta/common';
describe('Page', () => {
    test('clear', async () => {
        await Promise.all(
            project.page.loadListPath().map(async (name) => {
                return await project.page.remove({
                    name,
                });
            })
        );
        expect(true).toBe(true);
    });
    test('add page', async () => {
        await project.page.add({
            name: 'zzz',
            title: 'fff',
        });
        expect(project.page.load('zzz').exists()).toBe(true);
    });
    test('add page', async () => {
        await project.page.add({
            name: 'zzz',
            title: 'fff',
        });
    });
    test('get level', () => {
        const page = project.page.load('zzz');
        expect(page.getLevel(LEVEL_ENUM.project)).toBe(project);
    });
    test('remove page', async () => {
        await project.page.remove({
            name: 'zzz',
        });
        expect(project.page.load('zzz').exists()).toBe(false);
    });
    test('loadPages', async () => {
        await project.page.add({
            name: 'zzz',
            title: 'fff',
        });
        await project.page.add({
            name: 'zzzzzz',
            title: 'fff',
        });
        expect(project.page.loadListPath()).toEqual(['zzz', 'zzzzzz']);
        expect(project.page.loadList().map((item) => item.name)).toEqual(['zzz', 'zzzzzz']);
        expect(project.page.load('zzz')).toBeInstanceOf(Page);
        await project.page.remove({
            name: 'zzz',
        });
        await project.page.remove({
            name: 'zzzzzz',
        });
    });
});