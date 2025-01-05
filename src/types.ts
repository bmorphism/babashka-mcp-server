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

export const isValidBabashkaCommandArgs = (
  args: any
): args is BabashkaCommandArgs =>
  typeof args === "object" &&
  args !== null &&
  typeof args.code === "string" &&
  (args.timeout === undefined || typeof args.timeout === "number");

// Configuration constants
export const CONFIG = {
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_CACHED_COMMANDS: 10,
  BABASHKA_PATH: process.env.BABASHKA_PATH || "bb" // Allow custom bb path
} as const;
