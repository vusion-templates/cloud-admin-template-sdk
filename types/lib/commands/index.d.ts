export interface Command {
    [prop: string]: any;
}
export default function (root: string): Command;
