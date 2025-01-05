#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListResourcesRequestSchema, ReadResourceRequestSchema, ListToolsRequestSchema, CallToolRequestSchema, ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { CONFIG, isValidBabashkaCommandArgs } from "./types.js";
const execAsync = promisify(exec);
class BabashkaServer {
    server;
    recentCommands = [];
    constructor() {
        this.server = new Server({
            name: "babashka-mcp-server",
            version: "0.1.0"
        }, {
            capabilities: {
                resources: {},
                tools: {}
            }
        });
        this.setupHandlers();
        this.setupErrorHandling();
    }
    setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error("[MCP Error]", error);
        };
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupHandlers() {
        this.setupResourceHandlers();
        this.setupToolHandlers();
    }
    setupResourceHandlers() {
        // List available resources (recent commands)
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
            resources: this.recentCommands.map((cmd, index) => ({
                uri: `babashka://commands/${index}`,
                name: `Recent command: ${cmd.code.slice(0, 50)}${cmd.code.length > 50 ? '...' : ''}`,
                mimeType: "application/json",
                description: `Command executed at ${cmd.timestamp}`
            }))
        }));
        // Read specific resource
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const match = request.params.uri.match(/^babashka:\/\/commands\/(\d+)$/);
            if (!match) {
                throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${request.params.uri}`);
            }
            const index = parseInt(match[1]);
            const command = this.recentCommands[index];
            if (!command) {
                throw new McpError(ErrorCode.InvalidRequest, `Command result not found: ${index}`);
            }
            return {
                contents: [{
                        uri: request.params.uri,
                        mimeType: "application/json",
                        text: JSON.stringify(command, null, 2)
                    }]
            };
        });
    }
    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [{
                    name: "execute",
                    description: "Execute Babashka (bb) code",
                    inputSchema: {
                        type: "object",
                        properties: {
                            code: {
                                type: "string",
                                description: "Babashka code to execute"
                            },
                            timeout: {
                                type: "number",
                                description: "Timeout in milliseconds (default: 30000)",
                                minimum: 1000,
                                maximum: 300000
                            }
                        },
                        required: ["code"]
                    }
                }]
        }));
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name !== "execute") {
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
            if (!isValidBabashkaCommandArgs(request.params.arguments)) {
                throw new McpError(ErrorCode.InvalidParams, "Invalid Babashka command arguments");
            }
            try {
                const timeout = request.params.arguments.timeout || CONFIG.DEFAULT_TIMEOUT;
                const { stdout, stderr } = await execAsync(`${CONFIG.BABASHKA_PATH} -e "${request.params.arguments.code.replace(/"/g, '\\"')}"`, { timeout });
                const result = {
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    exitCode: 0
                };
                // Cache the command result
                this.recentCommands.unshift({
                    code: request.params.arguments.code,
                    result,
                    timestamp: new Date().toISOString()
                });
                // Keep only recent commands
                if (this.recentCommands.length > CONFIG.MAX_CACHED_COMMANDS) {
                    this.recentCommands.pop();
                }
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }]
                };
            }
            catch (error) {
                const result = {
                    stdout: "",
                    stderr: error.message || "Unknown error",
                    exitCode: error.code || 1
                };
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }],
                    isError: true
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Babashka MCP server running on stdio");
    }
}
const server = new BabashkaServer();
server.run().catch(console.error);
