/**
 * @fileoverview Maps node-version parity surface results into filtered, display-ready table rows for
 * Ink and OpenTUI parity shells.
 *
 * This file owns the `NodeVersionKit_ReportRow` view model, failing-status classification used for
 * optional failing-only filters, scope filtering, and display fallbacks when expected or observed
 * strings are absent.
 * Flow: `NodeParitySurfaceResult[]` -> optional scope/failing filter -> row objects for terminal tables.
 *
 * @testing Node test (tsx): npm run node-version-kit:test
 *
 * @see packages/node-version-kit/src/contracts.ts - Declares `NodeVersionKit_NodeParitySurfaceResult`, scopes, and parity statuses that drive filtering and which fields populate each report row here.
 * @see packages/node-version-kit/src/ink-app.tsx - Ink parity shell that calls `NodeVersionKit_filterSurfaceResults` and `NodeVersionKit_surfaceResultsToRows` when rendering the results table.
 * @see packages/node-version-kit/src/opentui-app.tsx - OpenTUI parity surface that applies the same row-mapping helpers for interactive table output.
 * @documentation reviewed=2026-05-22 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */

import type {
  NodeVersionKit_NodeParityScope,
  NodeVersionKit_NodeParityStatus,
  NodeVersionKit_NodeParitySurfaceResult,
} from "./contracts.js";

/** A single display row for a parity surface result. */
export interface NodeVersionKit_ReportRow {
  detail: string;
  expected: string;
  filePath?: string;
  observed: string;
  scope: NodeVersionKit_NodeParityScope;
  status: string;
  surface: string;
}

/** Returns true when a status represents parity drift or an unverifiable required surface. */
export function NodeVersionKit_isFailingStatus(
  status: NodeVersionKit_NodeParityStatus,
): boolean {
  return (
    status === "mismatch" ||
    status === "missing" ||
    status === "blocked" ||
    status === "error"
  );
}

/** Filters surface results by optional scope and failing-only flags. */
export function NodeVersionKit_filterSurfaceResults(
  results: readonly NodeVersionKit_NodeParitySurfaceResult[],
  options: { failingOnly?: boolean; scope?: NodeVersionKit_NodeParityScope },
): NodeVersionKit_NodeParitySurfaceResult[] {
  return results.filter((result) => {
    if (options.scope !== undefined && result.scope !== options.scope) {
      return false;
    }
    if (options.failingOnly && !NodeVersionKit_isFailingStatus(result.status)) {
      return false;
    }
    return true;
  });
}

/** Maps raw surface results into display-friendly row objects. */
export function NodeVersionKit_surfaceResultsToRows(
  results: readonly NodeVersionKit_NodeParitySurfaceResult[],
): NodeVersionKit_ReportRow[] {
  return results.map((result) => ({
    detail: result.detail,
    expected: result.expected ?? "—",
    ...(result.filePath !== undefined ? { filePath: result.filePath } : {}),
    observed: result.observed ?? "—",
    scope: result.scope,
    status: result.status,
    surface: result.surface,
  }));
}
