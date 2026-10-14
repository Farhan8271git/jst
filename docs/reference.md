# Reference

This page provides a quick reference for development commands, generators,
quality checks, compatibility, and architecture configuration in JST.

For contribution requirements, see the project's
[contribution guidelines](../CONTRIBUTING.md).

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run typecheck` | Generate route types and check TypeScript. |
| `npm run build` | Build the production application after type checking. |
| `npm start` | Serve the production build. |
| `npm run jst:mcp` | Start the project-local JST MCP server. |

The server exposes `jst_start_task`, `jst_scaffold_slice`, `jst_get_recipe`, and `jst_check`. See [`@jst-stack/mcp`](https://github.com/jst-stack/jst-mcp#readme) for client configuration and the optional Pi adapter.

## Generators

Use the slice generator to create an entity, feature, module, or widget
following the project's architecture conventions.

Examples:

```bash
npm run create:slice -- entity account
npm run create:slice -- feature signIn
npm run create:slice -- module projectManagement --stateful
npm run create:slice -- widget accountSummary
```

Create a workspace package with:

```bash
npm run create:package -- orderOperations
```

See the [architecture guide](architecture.md) for layer boundaries,
public APIs, and guidance on choosing the right architecture.

## Quality checks

### Local validation

Run linting:

```bash
npm run lint
```

Run unit tests:

```bash
npm run test:unit
```

Run linting, type checking, and unit tests together:

```bash
npm run validate
```

### Complete project checks

Run the full project quality checks:

```bash
npm run check
```

Run the release checks, including the production dependency audit
and end-to-end tests:

```bash
npm run check:release
```

For browser testing, see the project's
[contribution guidelines](../CONTRIBUTING.md).

## Compatibility and releases

- [Supported versions](versions.md)
- [Compatibility contract](compatibility.md)
- [Release process](releasing.md)
- [Project health and engineering evidence](project-health.md)

The machine-readable compatibility information is maintained in
[`jst.compatibility.json`](../jst.compatibility.json).

## Architecture configuration

JST enforces architecture and source-quality conventions through
`@jst-stack/eslint-plugin`.

- [Architecture guide](architecture.md)
- [Plugin configuration documentation](https://github.com/jst-stack/eslint-plugin#configuration)
- [Plugin README](https://github.com/jst-stack/eslint-plugin#readme)
- [JST policy JSON Schema](https://github.com/jst-stack/eslint-plugin/blob/main/schema/jst-policy.schema.json)

Use the plugin documentation and schema as the authoritative references
for available policy options.
