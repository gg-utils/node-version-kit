/**
 * @fileoverview Re-exports the `@gg-utils/node-version-kit` public surface so consumers can import parity
 * contracts, command preview helpers, report-row mappers, and Ink or OpenTUI shells from the package
 * root entrypoint.
 *
 * This file owns the root barrel only; implementations live in sibling modules wired through
 * `package.json` `exports` and the `export *` lines below.
 * Flow: host imports `@gg-utils/node-version-kit` -> this barrel fans out to contracts, formatters, row
 * helpers, and terminal apps without duplicating symbols.
 *
 * @example
 * ```typescript
 * import type { NodeVersionKit_NodeParityReport } from "@gg-utils/node-version-kit";
 * import { NodeVersionKit_formatNpxCheckParityCommand } from "@gg-utils/node-version-kit";
 *
 * NodeVersionKit_formatNpxCheckParityCommand({
 *   checkParityScriptPath: "scripts/node-version/check-parity.ts",
 *   scope: "static",
 *   json: true,
 * });
 * ```
 *
 * @testing Node test runner (node:test via tsx): npm run node-version-kit:test
 *
 * @see packages/node-version-kit/README.md - Documents each public subpath, how host repos inject roots and parity script paths, and which root npm scripts verify this kit after changes.
 * @see packages/node-version-kit/src/contracts.ts - Canonical parity report, scope, and UI config types aggregated here so callers can depend on a single import path when they need shared shapes plus helpers.
 * @see packages/node-version-kit/package.json - Source of truth for the `exports` map that mirrors this barrel across `contracts`, `format-commands`, `report-rows`, `ink-app`, and `opentui-app` entrypoints.
 * @documentation reviewed=2026-05-22 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */
export * from "./contracts.js";
export * from "./format-commands.js";
export * from "./ink-app.js";
export * from "./opentui-app.js";
export * from "./report-rows.js";
//# sourceMappingURL=index.d.ts.map