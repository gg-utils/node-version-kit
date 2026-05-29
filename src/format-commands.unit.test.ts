/**
 * @fileoverview Verifies display-only preview strings for Node parity `npx tsx` check-parity lines
 * and root `npm run` parity test commands exposed by `@gg-utils/node-version-kit` format helpers.
 *
 * This file owns regression coverage for scope and `--json` flag assembly plus the npm-run wrapper
 * shape used in operator copy/paste hints.
 * Flow: invoke formatters with representative paths and options -> assert single-line shell text.
 *
 * @example
 * ```typescript
 * it("adds --scope and --json when requested", () => {
 *   assert.equal(
 *     NodeVersionKit_formatNpxCheckParityCommand({
 *       checkParityScriptPath: "tooling/node-version/check-parity.ts",
 *       json: true,
 *       scope: "static",
 *     }),
 *     "npx tsx tooling/node-version/check-parity.ts --scope static --json",
 *   );
 * });
 * ```
 *
 * @testing Node test runner (node:test via tsx): cd packages/node-version-kit && npm run test -- src/format-commands.unit.test.ts
 *
 * @see packages/node-version-kit/src/format-commands.ts - Pure string formatters whose `npx tsx` and `npm run` preview output this suite locks for kit terminals and script adapters.
 * @see packages/node-version-kit/src/contracts.ts - `NodeVersionKit_ScopeChoice` contract that governs when `--scope` is omitted for `all` versus appended for narrower scopes asserted here.
 * @documentation reviewed=2026-05-22 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  NodeVersionKit_formatNodeParityTestNpmScript,
  NodeVersionKit_formatNpxCheckParityCommand,
} from "./format-commands.js";

describe("NodeVersionKit_formatNpxCheckParityCommand", () => {
  it("formats all scopes without --scope", () => {
    assert.equal(
      NodeVersionKit_formatNpxCheckParityCommand({
        checkParityScriptPath: "tooling/node-version/check-parity.ts",
        scope: "all",
      }),
      "npx tsx tooling/node-version/check-parity.ts",
    );
  });

  it("adds --scope and --json when requested", () => {
    assert.equal(
      NodeVersionKit_formatNpxCheckParityCommand({
        checkParityScriptPath: "tooling/node-version/check-parity.ts",
        json: true,
        scope: "static",
      }),
      "npx tsx tooling/node-version/check-parity.ts --scope static --json",
    );
  });
});

describe("NodeVersionKit_formatNodeParityTestNpmScript", () => {
  it("returns the configured root npm script", () => {
    assert.equal(
      NodeVersionKit_formatNodeParityTestNpmScript("tooling:node:test"),
      "npm run tooling:node:test",
    );
  });
});
