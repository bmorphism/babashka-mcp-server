# Babashka MCP Server

A Model Context Protocol server for interacting with [Babashka](https://github.com/babashka/babashka), a native Clojure interpreter for scripting.

## Features

- Execute Babashka code through MCP tools
- Cache recent command results
- Access command history through MCP resources
- Configurable command timeouts

## Prerequisites

### Install Babashka

Babashka can be installed in several ways:

#### macOS
```bash
brew install borkdude/brew/babashka
```

#### Linux
```bash
bash < <(curl -s https://raw.githubusercontent.com/babashka/babashka/master/install)
```

#### Windows
```powershell
# Using scoop
scoop install babashka
```

For other installation methods, see the [official Babashka installation guide](https://github.com/babashka/babashka#installation).

### Verify Installation

After installation, verify Babashka works:
```bash
# Check version
bb --version

# Try a simple expression
bb -e '(+ 1 2 3)'

# Run a script from string
bb -e '(defn hello [x] (str "Hello, " x "!")) (hello "World")'

# Use -i flag to process lines of input
ls | bb -i '(take 2 *input*)'
```

## Installation

```bash
# Install dependencies
npm install

# Build the MCP server
npm run build
```

## Configuration

The server can be configured through environment variables:

- `BABASHKA_PATH`: Path to the Babashka executable (default: "bb")

## Tools

### execute

Execute Babashka code with optional timeout:

```typescript
{
  name: "execute",
  arguments: {
    code: string;      // Babashka code to execute
    timeout?: number;  // Timeout in milliseconds (default: 30000)
  }
}
```

Example:
```typescript
{
  name: "execute",
  arguments: {
    code: "(+ 1 2 3)",
    timeout: 5000
  }
}
```

## Resources

The server maintains a cache of recent command executions accessible through:

- `babashka://commands/{index}` - Access specific command results by index

## Babashka Language Features

### Tail Call Optimization (TCO)

Babashka supports explicit tail call optimization through the `recur` special form, but does not implement automatic TCO. For example:

```clojure
;; This will cause stack overflow
(defn countdown [n]
  (if (zero? n)
    :done
    (countdown (dec n))))

;; This works with TCO using recur
(defn countdown [n]
  (if (zero? n)
    :done
    (recur (dec n))))
```

## Useful Resources

### Official Resources
- [Babashka GitHub Repository](https://github.com/babashka/babashka) - The main Babashka project
- [Babashka Book](https://book.babashka.org) - Official documentation
- [Babashka Examples](https://github.com/babashka/babashka/blob/master/doc/examples.md) - Collection of example scripts

### Community Tools & Libraries
- [pod-babashka-buddy](https://github.com/babashka/pod-babashka-buddy) - Cryptographic API for Babashka
- [bb-clis](https://github.com/cldwalker/bb-clis) - Collection of useful Babashka CLI scripts
- [bb-scripts](https://github.com/vedang/bb-scripts) - Various utility scripts for Babashka

### Development Tools
- [setup-babashka](https://github.com/turtlequeue/setup-babashka) - GitHub Actions for installing Babashka
- [babashka-docker-action](https://github.com/tzafrirben/babashka-docker-action) - Run Babashka scripts in GitHub Actions

## Development

This server is designed to eventually become self-hosting, meaning it will be rewritten in Babashka itself. The current TypeScript implementation serves as a reference and starting point.

## Roadmap

1. **Self-Hosted Implementation**
   - Rewrite the MCP server in Babashka
   - Leverage Babashka's native capabilities for better performance
   - Remove Node.js dependency
   - Maintain full compatibility with MCP protocol
   - Support all current features:
     - Command execution
     - Resource management
     - Command history
     - Timeout handling

2. **Enhanced Features**
   - Add support for Babashka pods
   - Implement file watching capabilities
   - Add REPL integration
   - Support for multiple Babashka instances

3. **Performance Optimizations**
   - Implement caching strategies
   - Optimize resource usage
   - Reduce startup time

4. **Testing & Documentation**
   - Comprehensive test suite
   - API documentation
   - Usage examples
   - Performance benchmarks
