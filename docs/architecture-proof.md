# Reproduce the architecture repair loop

The repository includes one black-box proof of JST's central claim. It uses the public slice generator and normal ESLint configuration against a temporary project:

```text
clean generated slices
→ sibling-slice import and network effect in a view
→ two actionable failures
→ documented repair
→ green validation
```

Run it after installing dependencies:

```bash
npm run proof:architecture
```

The proof should complete in well under five minutes and finish with:

```text
[jst/import-contract] Do not import directly across features slices ...
Docs: https://github.com/jst-stack/eslint-plugin/blob/main/docs/rules/import-contract.md
[jst/effects-at-boundary] Move fetch access behind an entity repository ...
Docs: https://github.com/jst-stack/eslint-plugin/blob/main/docs/rules/effects-at-boundary.md
Architecture proof passed: green → rejected → repaired → green.
```

The temporary project is removed after success and failure. On failure, `artifacts/architecture-proof` retains the command log and final source state without dependencies. CI runs the same command on Linux, macOS, and Windows.

This proves only the two named violation families and the public repair loop. The plugin test corpus owns broader rule coverage; neither test claims that automated checks can prove every architecture decision.
