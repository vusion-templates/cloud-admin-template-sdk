import File from '../common/File';
export default class Route {
    root: string;
    fullPath: string;
    subFiles: {
        index: File;
    };
    constructor(root: string);
}
