import { ProjectPath } from '../common';
import Tree from '../common/tree';
import File from '../common/file';
export default class Apollo extends Tree implements ProjectPath {
    subFiles: {
        api: File;
        config: File;
        index: File;
    };
    static updateApollo(root: any, json: any): void;
}
