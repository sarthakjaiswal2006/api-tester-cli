

import { performance } from "node:perf_hooks";
const useColors = process.stdout.isTTY && !process.env.NO_COLOR;
const color = (text, code) =>
  useColors ? `\x1b[${code}m${text}\x1b[0m` : String(text);

function help() {
  console.log(`
api-tester - simple REST API testing tool

Usage:
  api-tester <method> <url> [options]

Methods:
  get, post, put, patch, delete

Options:
  -H "Key: Value"   Add a request header (repeatable)
  -d '<json>'       Send a JSON request body
  -q "key=value"    Add a query parameter (repeatable)
  -t <milliseconds> Request timeout (default: 10000)
  --help            Show this help

Examples:
  api-tester get https://jsonplaceholder.typicode.com/users
  api-tester post https://jsonplaceholder.typicode.com/posts -d '{"title":"Hello"}'
  api-tester get https://example.com -H "Authorization: Bearer TOKEN"
`);
}

function parseArgs(args) {
  const [method, url, ...rest] = args;
  const options = { headers: {}, query: [], timeout: 10000 };

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    const value = rest[i + 1];

    if (arg === "-H" || arg === "--header") {
      if (!value) throw new Error(`Missing value after ${arg}`);
      const splitAt = value.indexOf(":");
      if (splitAt < 1) throw new Error(`Invalid header "${value}". Use "Name: Value".`);
      options.headers[value.slice(0, splitAt).trim()] = value.slice(splitAt + 1).trim();
      i++;
    } else if (arg === "-d" || arg === "--data") {
      if (!value) throw new Error(`Missing JSON body after ${arg}`);
      options.data = JSON.parse(value);
      i++;
    } else if (arg === "-q" || arg === "--query") {
      if (!value || !value.includes("=")) throw new Error(`Invalid query. Use -q "key=value".`);
      options.query.push(value);
      i++;
    } else if (arg === "-t" || arg === "--timeout") {
      options.timeout = Number(value);
      if (!Number.isInteger(options.timeout) || options.timeout <= 0) {
        throw new Error("Timeout must be a positive number of milliseconds.");
      }
      i++;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return { method, url, ...options };
}

async function sendRequest({ method, url, headers, data, query, timeout }) {
  const parsedUrl = new URL(url);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  for (const item of query) {
    const [key, ...value] = item.split("=");
    parsedUrl.searchParams.append(key, value.join("="));
  }

  const body = data === undefined ? undefined : JSON.stringify(data);
  if (body && !Object.keys(headers).some(key => key.toLowerCase() === "content-type")) {
    headers["Content-Type"] = "application/json";
  }

  const start = performance.now();

  let response;
  try {
    response = await fetch(parsedUrl, {
      method: method.toUpperCase(),
      headers,
      body,
      signal: AbortSignal.timeout(timeout)
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeout}ms.`);
    }
    throw new Error(`Network error: ${error.cause?.message || error.message}`);
  }

  const responseBody = await response.text();
  const elapsed = (performance.now() - start).toFixed(2);
  const size = Buffer.byteLength(responseBody);

  const statusColor = response.status < 300 ? "32" : response.status < 400 ? "33" : "31";

  console.log("\n" + color("RESPONSE", "1"));
  console.log(`Status: ${color(`${response.status} ${response.statusText}`, statusColor)}`);
  console.log(`Time:   ${color(`${elapsed} ms`, "36")}`);
  console.log(`Size:   ${color(`${size} bytes`, "33")}`);

  console.log("\n" + color("BODY", "1"));
  if (!responseBody) {
    console.log("(empty response)");
  } else {
    try {
      console.log(JSON.stringify(JSON.parse(responseBody), null, 2));
    } catch {
      console.log(responseBody);
    }
  }
  console.log("");

  if (!response.ok) process.exitCode = 1;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    help();
    return;
  }

  const request = parseArgs(args);
  const methods = ["get", "post", "put", "patch", "delete"];

  if (!methods.includes(request.method?.toLowerCase())) {
    throw new Error(`Unsupported method "${request.method}". Use: ${methods.join(", ")}.`);
  }
  if (!request.url) throw new Error("Please provide a URL.");

  await sendRequest(request);
}

main().catch(error => {
  console.error(color(`Error: ${error.message}`, "31"));
  process.exitCode = 1;
});
