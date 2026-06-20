# Function Documentation Duty

This project requires **living documentation** for functions so reviewers, future you, and AI agents can understand behavior without reading every implementation.

## Who must do this

- **Developers** — when adding or materially changing functions
- **Cursor agents** — follow `.cursor/rules/function-documentation.mdc` on every relevant edit

## Where docs live

```
docs/
├── FUNCTION_DOCUMENTATION.md   ← this file (process + template)
└── functions/
    ├── README.md               ← index of all documented modules
    ├── recommend.md            ← example domain file
    ├── api-favorites.md
    ├── auth.md
    └── ...
```

- **One file per domain/module** (e.g. `recommend`, `api-favorites`, `groups-service`)
- Do **not** scatter function docs across README or inline comments only — the `docs/functions/` tree is the canonical registry

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

Copy this block into the appropriate `docs/functions/<domain>.md` file:

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
2. Open or create `docs/functions/<domain>.md`.
3. Add or update the function section using the template.
4. Update `docs/functions/README.md` index if you added a new domain file.
5. Commit code and docs together (same PR/commit when possible).

## Quality bar

- **Purpose** answers “why”, not “what line 3 does”
- **How it works** is enough for someone to reimplement or debug without opening the source
- Mention edge cases (empty input, auth failure, fallback behavior) when they matter
- Keep Turkish UI strings out of docs unless documenting i18n keys — write docs in English for consistency

## What not to document here

- React components (use component names only if they export a pure helper)
- Trivial utilities (`cn`, simple formatters)
- Generated types, Prisma/Drizzle artifacts, test doubles

## Example domain file

See [functions/recommend.md](./functions/recommend.md) for a starter example (fill in as `lib/recommend.ts` is implemented).
