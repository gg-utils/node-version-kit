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
export {};
//# sourceMappingURL=ink-app.unit.test.d.ts.map