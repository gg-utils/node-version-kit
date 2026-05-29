/**
 * @fileoverview Verifies parity surface row shaping and filtering helpers used when presenting
 * node-version kit parity results as UI report rows.
 *
 * This file owns regression coverage for failing-only filtering, scope filtering, and the
 * null-to-em-dash display mapping on table row fields.
 * Flow: build synthetic surface payloads -> invoke row helpers -> assert row shapes and counts.
 *
 * @example
 * ```typescript
 * it("maps null expected/observed to em dash", () => {
 *   const rows = NodeVersionKit_surfaceResultsToRows([
 *     {
 *       comparison: "info",
 *       detail: "x",
 *       expected: null,
 *       observed: null,
 *       scope: "runtime",
 *       status: "inactive",
 *       surface: "s",
 *     },
 *   ]);
 *   assert.equal(rows[0]?.expected, "—");
 * });
 * ```
 *
 * @testing Node test runner (node:test via tsx): cd packages/node-version-kit && npm run test -- src/report-rows.unit.test.ts
 *
 * @see packages/node-version-kit/src/report-rows.ts - Converts and filters parity surface payloads into display rows whose behavior these tests assert.
 * @see packages/node-version-kit/src/contracts.ts - Surface result and scope types exercised by the fixtures and filter options in this suite.
 * @documentation reviewed=2026-05-22 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { NodeVersionKit_NodeParitySurfaceResult } from "./contracts.js";
import {
  NodeVersionKit_filterSurfaceResults,
  NodeVersionKit_surfaceResultsToRows,
} from "./report-rows.js";

describe("NodeVersionKit_filterSurfaceResults", () => {
  const sample: NodeVersionKit_NodeParitySurfaceResult[] = [
    {
      comparison: "exact",
      detail: "ok",
      expected: "24",
      observed: "24",
      scope: "static",
      status: "aligned",
      surface: "a",
    },
    {
      comparison: "exact",
      detail: "bad",
      expected: "24",
      observed: "22",
      scope: "static",
      status: "mismatch",
      surface: "b",
    },
  ];

  it("filters failing only", () => {
    const rows = NodeVersionKit_filterSurfaceResults(sample, {
      failingOnly: true,
    });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.surface, "b");
  });

  it("filters by scope", () => {
    const hosted: NodeVersionKit_NodeParitySurfaceResult = {
      ...sample[0]!,
      scope: "hosted",
      surface: "c",
    };
    assert.equal(
      NodeVersionKit_filterSurfaceResults([...sample, hosted], {
        scope: "hosted",
      }).length,
      1,
    );
  });
});

describe("NodeVersionKit_surfaceResultsToRows", () => {
  it("maps null expected/observed to em dash", () => {
    const rows = NodeVersionKit_surfaceResultsToRows([
      {
        comparison: "info",
        detail: "x",
        expected: null,
        observed: null,
        scope: "runtime",
        status: "inactive",
        surface: "s",
      },
    ]);
    assert.equal(rows[0]?.expected, "—");
    assert.equal(rows[0]?.observed, "—");
  });
});
