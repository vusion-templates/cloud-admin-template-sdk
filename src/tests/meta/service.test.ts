import { project } from '../global';
describe('Service', () => {
    project.service.loadListPath().forEach((serviceName) => {
        project.service.remove(serviceName);
    });
    test('service add remove', () => {
        expect(project.service.loadListPath()).toEqual([]);
        project.service.add('xxx');
        expect(project.service.load('xxx').exists()).toEqual(true);
        project.service.remove('xxx');
        expect(project.service.load('xxx').exists()).toEqual(false);
        
    });
    const apiContent = JSON.stringify({
        list: {}
    });
    test('add mutil', () => {
        
        project.service.add('xxx', apiContent);
        project.service.add('xxx2');
        expect(project.service.loadListPath()).toEqual(['xxx', 'xxx2']);
        expect(project.service.load('xxx').subFiles.api.load()).toEqual(apiContent);
        project.service.remove('xxx');
        project.service.remove('xxx2');
    });
    test('rename', () => {
        project.service.add('xxx');
        project.service.load('xxx').rename('xxx3');
        expect(project.service.load('xxx').exists()).toEqual(false);
        expect(project.service.load('xxx3').exists()).toEqual(true);
        project.service.load('xxx3').save({
            api: apiContent
        });
        expect(project.service.load('xxx3').subFiles.api.load()).toEqual(apiContent);
        project.service.remove('xxx3');
    });
});