/**
 * @fileoverview Declares shared TypeScript contracts for node-version parity terminal UIs and the
 * injectable runners those shells call.
 *
 * This file owns parity scope unions, per-surface comparison results, full report envelopes, and
 * explicit UI configuration shapes shared by Ink and OpenTUI adapters without baking repo-specific
 * discovery logic into the type layer.
 * Flow: host adapter assembles `NodeVersionKit_NodeParityUiConfig` + `NodeVersionKit_RunCheck` -> shells consume `NodeVersionKit_NodeParityReport` -> row formatters read surface results.
 *
 * @example
 * ```typescript
 * import type { NodeVersionKit_NodeParityReport } from "@gg-utils/node-version-kit/contracts";
 *
 * function isAligned(report: NodeVersionKit_NodeParityReport): boolean {
 *   return report.ok && report.exitCode === 0;
 * }
 * ```
 *
 * @testing Node test (tsx): npm run node-version-kit:test
 *
 * @see packages/node-version-kit/README.md - Documents the public `@gg-utils/node-version-kit/contracts` entry and how host repos inject roots, surfaces, and the parity script path before launching shells.
 * @see packages/node-version-kit/src/report-rows.ts - Maps `NodeVersionKit_NodeParitySurfaceResult` rows into display strings using the comparison and status enums defined here.
 * @see packages/node-version-kit/src/ink-app.tsx - Ink parity console that imports `NodeVersionKit_NodeParityUiConfig` and `NodeVersionKit_RunCheck` from this module to wire injected behavior.
 * @documentation reviewed=2026-05-22 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */
export {};
//# sourceMappingURL=contracts.js.map