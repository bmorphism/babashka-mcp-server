export const isValidBabashkaCommandArgs = (args) => typeof args === "object" &&
    args !== null &&
    typeof args.code === "string" &&
    (args.timeout === undefined || typeof args.timeout === "number");
// Configuration constants
export const CONFIG = {
    DEFAULT_TIMEOUT: 30000, // 30 seconds
    MAX_CACHED_COMMANDS: 10,
    BABASHKA_PATH: process.env.BABASHKA_PATH || "bb" // Allow custom bb path
};
