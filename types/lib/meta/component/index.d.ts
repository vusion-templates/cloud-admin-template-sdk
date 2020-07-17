import { PlopConfig } from '../utils';
export interface AddComponent {
    name: string;
    directory: string;
}
export default class Component {
    static add(answers: AddComponent, config: PlopConfig): Promise<any>;
}
