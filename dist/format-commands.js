/**
 * @fileoverview Assembles display-only preview strings for Node parity tooling (`npx tsx` check-parity
 * invocations and root `npm run` parity test scripts) shared by `@gg-utils/node-version-kit` terminal UIs.
 *
 * This file owns pure string formatting only; it does not spawn processes or read the filesystem.
 * Flow: script path + scope flags -> single-line shell text for copy/paste and on-screen hints.
 *
 * @example
 * ```typescript
 * import {
 *   NodeVersionKit_formatNodeParityTestNpmScript,
 *   NodeVersionKit_formatNpxCheckParityCommand,
 * } from "@gg-utils/node-version-kit/format-commands";
 *
 * NodeVersionKit_formatNpxCheckParityCommand({
 *   checkParityScriptPath: "scripts/node-version/check-parity.ts",
 *   scope: "static",
 *   json: true,
 * });
 * NodeVersionKit_formatNodeParityTestNpmScript("tooling:node:test");
 * ```
 *
 * @testing Node test runner (node:test via tsx): cd packages/node-version-kit && npm run test -- src/format-commands.unit.test.ts
 *
 * @see packages/node-version-kit/src/format-commands.unit.test.ts - Unit tests that lock the `npx tsx` and `npm run` preview strings consumed by kit UIs and script adapters.
 * @see packages/node-version-kit/src/contracts.ts - `NodeVersionKit_ScopeChoice` contract that decides when `--scope` is appended for non-`all` runs.
 * @see packages/node-version-kit/src/ink-app.tsx - Ink parity UI that imports these helpers to render operator-facing command previews.
 * @documentation reviewed=2026-05-22 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */
/**
 * Formats the `npx tsx` command line for a configured check-parity script.
 *
 * @remarks
 * PURITY: pure string assembly; does not execute the command or touch disk.
 */
export function NodeVersionKit_formatNpxCheckParityCommand(options) {
    const parts = ["npx", "tsx", options.checkParityScriptPath];
    if (options.scope !== "all") {
        parts.push("--scope", options.scope);
    }
    if (options.json) {
        parts.push("--json");
    }
    return parts.join(" ");
}
/**
 * Returns a display-ready root `npm run` line for the configured parity test script name.
 *
 * @remarks
 * PURITY: pure string assembly; does not invoke npm.
 */
export function NodeVersionKit_formatNodeParityTestNpmScript(testNpmScriptName) {
    return `npm run ${testNpmScriptName}`;
}
//# sourceMappingURL=format-commands.js.map