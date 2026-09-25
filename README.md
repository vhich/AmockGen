# AmockGen

A high-performance, zero-config stateful API mocking CLI and server built for modern TypeScript monorepos.

amockgen parses OpenAPI (v3.x) specifications and instantly spins up a local HTTP mock server paired with interactive documentation, dynamic stateful data generation, request payload validation, and color-coded terminal telemetry.

## Features

- Zero-Config Developer Workflow: Automatically detects openapi.json or openapi.yaml in your active working directory or bootstraps a ready-to-use template if none exists.

- Stateful In-Memory Store: Implements full CRUD persistence across resources **(GET, POST, PUT, PATCH, DELETE)** during the server lifecycle.

- Dynamic Data Engine: Generates realistic, schema-driven mock data powered by **@faker-js/faker** based on property types, formats, and key-naming heuristics.

- Schema Validation: Uses **Ajv and ajv-formats** to strictly validate incoming **POST**, **PUT**, and **PATCH** request payloads, returning standard **422 Unprocessable Entity** responses on schema mismatches.

- Interactive Documentation UI: Embeds Stoplight Elements locally at /docs for testing and exploring endpoints.

- Hot-Reloading: Monitors OpenAPI specification files for updates and automatically reloads server routes and schemas in real time.

- Visual Terminal Telemetry: Built-in **ANSI** escape sequences format request methods, HTTP status codes, and execution times (in ms) with distinct color highlights.

## Monorepo Architecture

AmockGen is structured as a pnpm workspace managed with turbo:

```
amockgen/
├── packages/
│   ├── core/           # Parser, Ajv schema validator, and Faker data generator engine
│   ├── mock-server/    # Fastify server, MockStore state manager, and colored logging hooks
│   ├── docs-ui/        # Stoplight Elements HTML template handler
│   └── cli/            # Commander CLI binary, path resolver, and file watcher
├── package.json
└── turbo.json
```

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8

## Developement Setup

1. ### Clone the repository:

`git clone https://github.com/YOUR_USERNAME/amockgen.git`
`cd amockgen`

### Install workspace dependencies:

`pnpm install`

### Build all workspace packages:

`pnpm build`

### Start the mock server:

`pnpm start`

## Usage:

When you run pnpm start from your project root, amockgen:

- Resolves openapi.json / openapi.yaml in your current directory.

- Serves the interactive API documentation UI at http://localhost:8083/docs.

- Sets up mock HTTP endpoints under http://localhost:8083.

## Example Log Output

Parsing OpenAPI spec: C:\Users\user\amockgen\openapi.json

```
┌─────────────────────────────────────────────────────────────┐
│ 🚀 API Mock Server & Documentation Running                  │
│                                                             │
│ • Interactive Docs: http://localhost:8083/docs              │
│ • Mock API Base: http://localhost:8083                      │
│ • Spec File: openapi.json                                   │
│ • Status: Active                                            │
└─────────────────────────────────────────────────────────────┘

│ [16:02:12] PUT /todos/0c6dd1a2 - 404 Not Found (6ms)
│ [16:02:17] GET /todos - 200 OK (0ms)
│ [16:03:01] POST /todos - 422 Unprocessable Entity (55ms)
│ [16:03:29] POST /todos - 201 Created (3ms)

```

## Tech Stack

- Server Framework: Fastify

- OpenAPI Parser: @apidevtools/swagger-parser

- Validation Engine: Ajv + ajv-formats

- Data Mocking: @faker-js/faker

- CLI Engine: Commander

- File Watcher: Chokidar

- Monorepo Tooling: pnpm workspaces + Turborepo

## License:

**MIT**
