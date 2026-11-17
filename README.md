# api-tester-cli

A lightweight command-line REST API testing tool for the terminal — like a fast, native Postman right inside your shell.

Built with **zero bloated dependencies**: powered by native Node.js ES Modules, Commander.js, native Fetch API, and ANSI escape codes.

---

## Features (Phase 1: Basic CLI)

- **HTTP Methods**: GET and POST commands with intuitive syntax.
- **URL Arguments**: Direct URL arguments with automatic validation (HTTP & HTTPS).
- **Request Bodies**: Send JSON payloads via `--data` / `-d` with automatic JSON validation and `Content-Type` header defaults.
- **Custom Headers**: Add one or multiple HTTP headers via `--header` / `-H` (e.g., `-H "Authorization: Bearer TOKEN"`).
- **Status Display**: Color-coded HTTP status code and status text (Green for 2xx, Cyan for 3xx, Yellow for 4xx, Red for 5xx).
- **Performance Metrics**: High-precision response time measurement in milliseconds/seconds.
- **Payload Metrics**: Exact response payload size measurement (B, KB, MB).
- **Pretty-Printed JSON**: Formatted 2-space indented JSON output with native terminal syntax highlighting (keys, strings, numbers, booleans, null).
- **Plain Text Support**: Graceful fallback and display for non-JSON responses.
- **Error Handling**: Friendly error messages for invalid URLs, malformed JSON, network failures (ENOTFOUND, ECONNREFUSED), and request timeouts.
- **Custom Timeouts**: Configure request timeouts via `--timeout` / `-t` (default: 10,000 ms).

---

## Installation & Local Setup

### Prerequisites
- Node.js v18.0.0 or higher (v20+ recommended)

### Clone & Install

```bash
git clone https://github.com/sarthakjaiswal2006/api-tester-cli.git
cd api-tester-cli
npm install
```

### Run Locally

You can run the CLI directly using Node:
```bash
node index.js --help
```

Or execute it directly via the executable entry point:
```bash
./index.js --help
```

To use `api-tester` globally in your terminal during local development:
```bash
npm link
api-tester --help
```

---

## Usage & Examples

### 1. Send a GET Request

```bash
api-tester get https://jsonplaceholder.typicode.com/users/1
```

### 2. Send a GET Request with Custom Headers

```bash
api-tester get https://jsonplaceholder.typicode.com/users/1 --header "Authorization: Bearer my-secret-token"
```

Multiple headers can be specified by repeating `-H`:
```bash
api-tester get https://jsonplaceholder.typicode.com/users/1 -H "Authorization: Bearer TOKEN" -H "Accept: application/json"
```

### 3. Send a POST Request with JSON Body

```bash
api-tester post https://jsonplaceholder.typicode.com/posts --data '{"title":"Test Post","body":"Hello World","userId":1}'
```

Short option `-d`:
```bash
api-tester post https://jsonplaceholder.typicode.com/posts -d '{"title":"Test Post","body":"Hello World","userId":1}'
```

### 4. Custom Request Timeout

Specify request timeout in milliseconds using `-t` or `--timeout`:
```bash
api-tester get https://jsonplaceholder.typicode.com/users --timeout 5000
```

---

## Error Handling

`api-tester-cli` provides clear, readable error messages without cryptic stack traces:

- **Invalid URL format**:
  ```bash
  $ api-tester get my-api.com
  Error: Invalid URL "my-api.com". Missing protocol — did you mean "https://my-api.com"?
  ```

- **Malformed JSON payload**:
  ```bash
  $ api-tester post https://jsonplaceholder.typicode.com/posts --data '{title: invalid}'
  Error: Invalid JSON body in --data: Unexpected token 't', "{title: invalid}" is not valid JSON
  ```

- **Network connection failure**:
  ```bash
  $ api-tester get https://non-existent-api-domain.org
  Network Error: Could not resolve host "non-existent-api-domain.org" (ENOTFOUND). Please verify the URL and your connection.
  ```

- **Request Timeout**:
  ```bash
  $ api-tester get https://jsonplaceholder.typicode.com/users --timeout 10
  Request Error: Request timed out after 10ms.
  ```

---

## Project Roadmap

- [x] **Phase 1: Basic CLI** (Commander setup, GET & POST, headers, JSON body, metrics, ANSI formatting, timeout & error handling)
- [ ] **Phase 2: Advanced Request Features** (PUT, PATCH, DELETE, query params, advanced auth)
- [ ] **Phase 3: Request Management** (Save requests, collections, history)
- [ ] **Phase 4: Testing Engine** (Status assertions, property & value assertions, response time assertions, test reports)
- [ ] **Phase 5: Environment Management** (Environments, variable substitution, secure credentials)

---

## License

MIT
