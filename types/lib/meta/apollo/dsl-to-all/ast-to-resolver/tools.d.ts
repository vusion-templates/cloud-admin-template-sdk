import { ExtraOptions, GlobalEnv } from ".";
export declare function stringRepeat(str: string, num: number): string;
export declare function hasLineTerminator(str: string): boolean;
export declare function endsWithLineTerminator(str: string): any;
export declare function merge(target: any, override: any): any;
export declare function updateDeeply(target: {
    [key: string]: any;
}, override: {
    [key: string]: any;
}): ExtraOptions;
export declare function escapeRegExpCharacter(ch: number, previousIsBackslash: boolean): string;
export declare function escapeDirective(str: string, globalEnv: GlobalEnv): string;
export declare function escapeString(str: string, globalEnv: GlobalEnv): string;
/**
* flatten an array to a string, where the array can contain
* either strings or nested arrays
*/
export declare function flattenToString(arr: string[]): string;
/**
* convert generated to a SourceNode when source maps are enabled.
*/
export declare function toSourceNodeWhenNeeded(generated: any, node: any, globalEnv: GlobalEnv): any;
export declare function noEmptySpace(space: string): string;
/**
 *
 */
export declare function join(left: any, right: any, globalEnv: GlobalEnv): any[];
export declare function addIndent(stmt: any, globalEnv: GlobalEnv): any[];
export declare function calculateSpaces(str: string): number;
export declare function parenthesize(text: string | string[], current: number, should: number): string | (string | string[])[];
