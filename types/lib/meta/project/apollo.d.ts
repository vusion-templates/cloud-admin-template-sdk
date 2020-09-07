import type Project from './';
export interface ApolloOP {
    updateApollo(JSON: any): void;
}
export default function (projectRoot: string, project: Project): ApolloOP;
