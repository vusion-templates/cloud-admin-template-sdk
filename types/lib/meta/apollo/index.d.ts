import { ProjectPath } from '../common';
import Tree from '../common/tree';
import File from '../common/file';
export default class Apollo extends Tree implements ProjectPath {
    subFiles: {
        api: File;
        config: File;
        index: File;
    };
    /**
     * TODO
     * 1. generator resolver
     * 2. write file to right path
     *
     */
    static updateApollo(root: any, json: any): Promise<void>;
}
