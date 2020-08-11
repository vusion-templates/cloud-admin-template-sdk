import File from '../common/file';
export default class Route {
    root: string;
    fullPath: string;
    subFiles: {
        index: File;
    };
    constructor(root: string);
}
