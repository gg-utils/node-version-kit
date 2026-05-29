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
/** Which surface category a parity check runs against. */
export type NodeVersionKit_NodeParityScope = "static" | "hosted" | "runtime";
/** Scope selector exposed in terminal UIs; `all` runs every parity scope. */
export type NodeVersionKit_ScopeChoice = "all" | NodeVersionKit_NodeParityScope;
/** How one observed version is compared to the canonical contract. */
export type NodeVersionKit_NodeParityComparison = "exact" | "range" | "major-line" | "reference" | "info";
/** Outcome of one parity surface comparison. */
export type NodeVersionKit_NodeParityStatus = "aligned" | "mismatch" | "missing" | "blocked" | "inactive" | "error" | "info";
/** Canonical version contract displayed by parity report UIs. */
export interface NodeVersionKit_NodeParityContract {
    engineRange: string;
    exactVersion: string;
    major: number;
    majorLine: string;
    normalizedExactVersion: string;
    sourceFilePath: string;
}
/** Result for one checked surface. */
export interface NodeVersionKit_NodeParitySurfaceResult {
    comparison: NodeVersionKit_NodeParityComparison;
    detail: string;
    expected: string | null;
    filePath?: string;
    observed: string | null;
    scope: NodeVersionKit_NodeParityScope;
    status: NodeVersionKit_NodeParityStatus;
    surface: string;
}
/** Full parity report shape consumed by terminal UIs. */
export interface NodeVersionKit_NodeParityReport {
    contract: NodeVersionKit_NodeParityContract;
    createdAt: string;
    exitCode: number;
    ok: boolean;
    results: readonly NodeVersionKit_NodeParitySurfaceResult[];
    scopes: readonly NodeVersionKit_NodeParityScope[];
}
/** File-based parity surface metadata shown in diagnostics. */
export interface NodeVersionKit_FileSurfaceDefinition {
    filePath: string;
    label: string;
}
/** Hosted Vercel project metadata shown in diagnostics. */
export interface NodeVersionKit_VercelProjectDefinition {
    projectName: string;
    teamScope: string;
}
/** Explicit project config required by reusable node-version terminal parity shells. */
export interface NodeVersionKit_NodeParityUiConfig {
    additionalConfigDirectories: readonly NodeVersionKit_FileSurfaceDefinition[];
    checkParityScriptPath: string;
    nvmrcSurfaceDefinitions: readonly NodeVersionKit_FileSurfaceDefinition[];
    packageJsonSurfaceDefinitions: readonly NodeVersionKit_FileSurfaceDefinition[];
    renderBlueprintSurfaceDefinitions: readonly NodeVersionKit_FileSurfaceDefinition[];
    repoRoot: string;
    rootNvmrcPath: string;
    testNpmScriptName: string;
    vercelProjectDefinitions: readonly NodeVersionKit_VercelProjectDefinition[];
}
/** Explicit project config required by the reusable OpenTUI parity shell. */
export interface NodeVersionKit_OpenTuiConfig extends NodeVersionKit_NodeParityUiConfig {
}
/** Explicit project config required by the reusable Ink parity shell. */
export interface NodeVersionKit_InkConfig extends NodeVersionKit_NodeParityUiConfig {
}
/** Injectable parity runner for terminal apps. */
export type NodeVersionKit_RunCheck = (options: {
    readonly scopeArg?: NodeVersionKit_NodeParityScope;
}) => Promise<NodeVersionKit_NodeParityReport>;
/** Injectable human report formatter for terminal result panes. */
export type NodeVersionKit_FormatHumanReport = (report: NodeVersionKit_NodeParityReport) => string;
//# sourceMappingURL=contracts.d.ts.map