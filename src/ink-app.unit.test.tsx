/**
 * @fileoverview Verifies initial Ink string-render output for the node-version parity terminal UI
 * (`NodeVersionKitInkApp`) using stubbed parity results.
 *
 * This file owns regression coverage for the first-paint menu text shown before running parity
 * checks, including the configured npm script label surfaced in the UI.
 * Flow: render `NodeVersionKitInkApp` with fixture config and stubbed `runCheck` -> assert key menu
 * substrings in `renderToString` output.
 *
 * @testing Node test runner (node:test via tsx): cd packages/node-version-kit && npm run test -- src/ink-app.unit.test.tsx
 *
 * @see packages/node-version-kit/src/ink-app.tsx - Ink/React UI component under test whose initial menu text and wiring this suite asserts via `renderToString`.
 * @see packages/node-version-kit/src/contracts.ts - `NodeVersionKit_InkConfig` and `NodeVersionKit_NodeParityReport` contracts that shape the fixture config and stubbed parity payload used here.
 * @documentation reviewed=2026-05-22 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { renderToString } from "ink";
import React from "react";

import type {
  NodeVersionKit_InkConfig,
  NodeVersionKit_NodeParityReport,
} from "./contracts.js";
import { NodeVersionKitInkApp } from "./ink-app.js";

const TEST_CONFIG: NodeVersionKit_InkConfig = {
  additionalConfigDirectories: [],
  checkParityScriptPath: "tooling/node-version/check-parity.ts",
  nvmrcSurfaceDefinitions: [],
  packageJsonSurfaceDefinitions: [],
  renderBlueprintSurfaceDefinitions: [],
  repoRoot: "/workspace",
  rootNvmrcPath: "/workspace/.nvmrc",
  testNpmScriptName: "tooling:node:test",
  vercelProjectDefinitions: [],
};

describe("NodeVersionKitInkApp", () => {
  it("renders main menu text on initial paint", () => {
    const output = renderToString(
      <NodeVersionKitInkApp
        config={TEST_CONFIG}
        formatHumanReport={(report: NodeVersionKit_NodeParityReport) =>
          JSON.stringify(report)
        }
        runCheck={async () => ({
          contract: {
            engineRange: ">=24 <25",
            exactVersion: "24.11.1",
            major: 24,
            majorLine: "24.x",
            normalizedExactVersion: "24.11.1",
            sourceFilePath: TEST_CONFIG.rootNvmrcPath,
          },
          createdAt: "2026-05-21T00:00:00.000Z",
          exitCode: 0,
          ok: true,
          results: [],
          scopes: [],
        })}
      />,
    );

    assert.match(output, /Node parity/);
    assert.match(output, /Run parity check/);
    assert.match(output, /tooling:node:test/);
  });
});
