# Function Documentation Duty

This project requires **living documentation** for functions so reviewers, future you, and AI agents can understand behavior without reading every implementation.

## Who must do this

- **Developers** — when adding or materially changing functions
- **Cursor agents** — follow `.cursor/rules/function-documentation.mdc` on every relevant edit

## Where docs live

```
docs/
├── en/
│   ├── FUNCTION_DOCUMENTATION.md   ← this file (process + template)
│   ├── functions/                  ← English function reference
│   └── screenshots/
└── tr/
    ├── FUNCTION_DOCUMENTATION.md   ← Turkish process + template
    ├── functions/                  ← Turkish function reference
    └── screenshots/
```

- **One file per domain/module** (e.g. `recommend`, `favorites-groups`, `auth`)
- Keep **English and Turkish** function docs in sync when you add or change entries
- Do **not** scatter function docs across README or inline comments only — `docs/en/functions/` and `docs/tr/functions/` are the canonical registries

## What each entry must include

| Field | Description |
|-------|-------------|
| **Name** | Exact function name (with file path) |
| **Purpose** | What it does and why it exists |
| **How it works** | Step-by-step logic, algorithms, or flow |
| **Inputs** | Parameters and types (or “none”) |
| **Returns** | Return type and meaning |
| **Side effects** | DB writes, API calls, global state — or “none” |
| **Dependencies** | Other modules, env vars, external services |
| **Example** | Short usage snippet when behavior is not obvious |

## Standard template

Copy this block into the appropriate `docs/en/functions/<domain>.md` and `docs/tr/functions/<domain>.md` files:

```markdown
### `functionName`

- **File:** `path/to/file.ts`
- **Purpose:** One sentence describing what this function is for.
- **How it works:**
  1. First step
  2. Second step
  3. Final step / return
- **Inputs:** `paramA: TypeA`, `paramB?: TypeB`
- **Returns:** `ReturnType` — what the caller receives
- **Side effects:** None | list DB/API/state changes
- **Dependencies:** `otherModule`, `DATABASE_URL`, etc.
- **Example:**
  ```ts
  const result = functionName(arg1, arg2);
  ```
```

## Workflow

1. Implement or change the function in code.
2. Open or create `docs/en/functions/<domain>.md` and `docs/tr/functions/<domain>.md`.
3. Add or update the function section using the template (both languages).
4. Update `docs/en/functions/README.md` and `docs/tr/functions/README.md` if you added a new domain file.
5. Commit code and docs together (same PR/commit when possible).

## Quality bar

- **Purpose** answers “why”, not “what line 3 does”
- **How it works** is enough for someone to reimplement or debug without opening the source
- Mention edge cases (empty input, auth failure, fallback behavior) when they matter

## What not to document here

- React components (use component names only if they export a pure helper)
- Trivial utilities (`cn`, simple formatters)
- Generated types, Prisma/Drizzle artifacts, test doubles

## Example domain file

See [functions/recommend.md](./functions/recommend.md).
