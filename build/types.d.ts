export interface BabashkaCommandArgs {
    code: string;
    timeout?: number;
}
export interface BabashkaCommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}
export interface CachedCommand {
    code: string;
    result: BabashkaCommandResult;
    timestamp: string;
}
export declare const isValidBabashkaCommandArgs: (args: any) => args is BabashkaCommandArgs;
export declare const CONFIG: {
    readonly DEFAULT_TIMEOUT: 30000;
    readonly MAX_CACHED_COMMANDS: 10;
    readonly BABASHKA_PATH: string;
};
//# sourceMappingURL=types.d.ts.map