import * as fs from 'fs-extra';
import * as path from 'path';
import { templatePath } from '../../utils';
import { ProjectPath, LEVEL_ENUM } from '../common';
import Tree from '../common/tree';
import File from '../common/file';
import Directory from '../common/directory';
import type Project from '../Project';
import { buildSchema, printSchema, print } from 'graphql';
import { TransforDSL } from './dsl-to-all';

export default class Apollo extends Tree implements ProjectPath {
  public subFiles: {
      api: File;
      config: File;
      index: File;
  }
  /**
   * 1. generator schema and resolvers
   * 2. write file to right path
   *  
   */
  static async updateApollo(root: string, json: any) {
    await	TransforDSL(json, root);
  }
}