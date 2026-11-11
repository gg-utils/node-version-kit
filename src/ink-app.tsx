/**
 * @fileoverview Renders the package-owned Ink menu and run-state UI for node-version parity checks.
 *
 * This component owns the reusable Ink experience for choosing a parity scope and running an injected parity check.
 *
 * Flow: selected scope and launch options -> command preview -> parity run -> rendered result state.
 *
 * @testing Node unit: npm run node-version-kit:test
 * @see root Ink entrypoint - Boots the Ink renderer that mounts this component.
 * @see packages/node-version-kit/src/format-commands.ts - Supplies the command preview strings.
 * @see packages/node-version-kit/src/report-rows.ts - Supplies the table rows shown after a run.
 * @documentation reviewed=2026-04-11 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */
import { spawn } from "node:child_process";

import React, { useEffect, useState } from "react";
import { Box, Text, useApp, useInput, useIsScreenReaderEnabled } from "ink";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";

import type {
  NodeVersionKit_FormatHumanReport,
  NodeVersionKit_InkConfig,
  NodeVersionKit_NodeParityReport,
  NodeVersionKit_RunCheck,
  NodeVersionKit_ScopeChoice,
} from "./contracts.js";
import {
  NodeVersionKit_formatNodeParityTestNpmScript,
  NodeVersionKit_formatNpxCheckParityCommand,
} from "./format-commands.js";
import {
  NodeVersionKit_filterSurfaceResults,
  NodeVersionKit_surfaceResultsToRows,
} from "./report-rows.js";

/** Captured child-process output line shown by the package-owned Ink test route. */
type NodeVersionKit_InkCapturedOutputLine = {
  source: "stderr" | "stdout";
  text: string;
};

/** Renders a compact command preview block without depending on root script UI helpers. */
function NodeVersionKitInkCommandPreview(props: {
  commandLine: string;
  title: string;
}): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Text bold>{props.title}</Text>
      <Text>{props.commandLine}</Text>
    </Box>
  );
}

/** Renders captured subprocess output with optional source labels and tail limiting. */
function NodeVersionKitInkCapturedOutputBlock(props: {
  bracketSource?: boolean;
  lines: readonly NodeVersionKit_InkCapturedOutputLine[];
  maxLines: number;
  title: string;
}): React.ReactElement {
  const visibleLines = props.lines.slice(-props.maxLines);
  return (
    <Box flexDirection="column">
      <Text bold>{props.title}</Text>
      {visibleLines.length === 0 ? <Text dimColor>—</Text> : null}
      {visibleLines.map((line, index) => (
        <Text key={`${String(index)}:${line.source}`} wrap="truncate-end">
          {props.bracketSource ? `[${line.source}] ` : ""}
          {line.text}
        </Text>
      ))}
    </Box>
  );
}

/** Appends split stdout/stderr chunks to a captured-output line buffer. */
function NodeVersionKitInk_appendCapturedChunk(options: {
  chunk: Buffer;
  setLines: React.Dispatch<
    React.SetStateAction<NodeVersionKit_InkCapturedOutputLine[]>
  >;
  source: "stderr" | "stdout";
}): void {
  const text = options.chunk.toString();
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map((line) => ({ source: options.source, text: line }));
  if (lines.length > 0) {
    options.setLines((previous) => [...previous, ...lines]);
  }
}

/**
 * Main menu route: keyboard shortcuts jump to parity, diagnostics reference, or configured test flow.
 */
function MenuRoute(props: { testNpmScriptName: string }): React.ReactElement {
  const navigate = useNavigate();
  const { exit } = useApp();
  const screenReader = useIsScreenReaderEnabled();

  useInput((input, key) => {
    if (input === "1") {
      void navigate("/parity");
      return;
    }
    if (input === "2") {
      void navigate("/diagnostics");
      return;
    }
    if (input === "3") {
      void navigate("/tests");
      return;
    }
    if (input === "q" || key.escape) {
      exit();
    }
  });

  return (
    <Box
      flexDirection="column"
      {...(screenReader ? { "aria-label": "Node parity main menu" } : {})}
    >
      <Text bold>Node parity (Ink)</Text>
      <Text> </Text>
      <Text>1 — Run parity check</Text>
      <Text>2 — Diagnostics (surfaces reference)</Text>
      <Text>3 — Run {props.testNpmScriptName}</Text>
      <Text>q — Quit</Text>
    </Box>
  );
}

/**
 * Discriminates parity-route UI steps from scope selection through preview, run, and results.
 */
type ParityPhase = "preview" | "result" | "running" | "scope";

/**
 * Parity check wizard: scope and JSON toggles, CLI preview, in-process run, then tabular results.
 *
 * @remarks
 * Effect cleanup sets `cancelled` so late async results from the injected parity runner do not apply after unmount or phase change.
 */
function ParityRoute(props: {
  config: NodeVersionKit_InkConfig;
  formatHumanReport: NodeVersionKit_FormatHumanReport;
  runCheck: NodeVersionKit_RunCheck;
}): React.ReactElement {
  const { config, formatHumanReport, runCheck } = props;
  const navigate = useNavigate();
  const [phase, setPhase] = useState<ParityPhase>("scope");
  const [scopeChoice, setScopeChoice] =
    useState<NodeVersionKit_ScopeChoice>("all");
  const [emitJson, setEmitJson] = useState(false);
  const [report, setReport] = useState<NodeVersionKit_NodeParityReport | null>(
    null,
  );
  const [runError, setRunError] = useState("");
  const [failingOnly, setFailingOnly] = useState(false);
  const screenReader = useIsScreenReaderEnabled();

  useEffect(() => {
    if (phase !== "running") {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const scopeArg = scopeChoice === "all" ? undefined : scopeChoice;
        const nextReport = await runCheck(scopeArg === undefined ? {} : { scopeArg });
        if (!cancelled) {
          setReport(nextReport);
          setRunError("");
          setPhase("result");
        }
      } catch (error) {
        if (!cancelled) {
          setRunError(error instanceof Error ? error.message : String(error));
          setReport(null);
          setPhase("result");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [phase, runCheck, scopeChoice]);

  useInput((input, key) => {
    if (key.escape) {
      void navigate("/");
      return;
    }

    if (phase === "scope") {
      if (input === "1") {
        setScopeChoice("all");
        return;
      }
      if (input === "2") {
        setScopeChoice("static");
        return;
      }
      if (input === "3") {
        setScopeChoice("hosted");
        return;
      }
      if (input === "4") {
        setScopeChoice("runtime");
        return;
      }
      if (input === "j") {
        setEmitJson((previous) => !previous);
        return;
      }
      if (input === "n" || key.return) {
        setPhase("preview");
        return;
      }
      return;
    }

    if (phase === "preview") {
      if (input === "b") {
        setPhase("scope");
        return;
      }
      if (input === "r" || key.return) {
        setPhase("running");
        return;
      }
      return;
    }

    if (phase === "result") {
      if (input === "b") {
        setPhase("scope");
        setReport(null);
        setRunError("");
        return;
      }
      if (input === "f") {
        setFailingOnly((previous) => !previous);
        return;
      }
    }
  });

  const commandLine = NodeVersionKit_formatNpxCheckParityCommand({
    checkParityScriptPath: config.checkParityScriptPath,
    json: emitJson,
    scope: scopeChoice,
  });

  if (phase === "scope") {
    return (
      <Box
        flexDirection="column"
        {...(screenReader ? { "aria-label": "Parity scope selection" } : {})}
      >
        <Text bold>Parity — scope</Text>
        <Text> </Text>
        <Text>
          Scope: 1=all 2=static 3=hosted 4=runtime | j=toggle JSON output (
          {emitJson ? "on" : "off"})
        </Text>
        <Text>n or Enter — continue to preview | Esc — menu</Text>
        <Text> </Text>
        <Text>
          Selected: {scopeChoice}
          {emitJson ? " + JSON" : ""}
        </Text>
      </Box>
    );
  }

  if (phase === "preview") {
    return (
      <Box flexDirection="column">
        <Text bold>Parity — command preview</Text>
        <NodeVersionKitInkCommandPreview
          commandLine={commandLine}
          title="Canonical CLI"
        />
        <Text> </Text>
        <Text>Enter or r — run in-process | b — back | Esc — menu</Text>
      </Box>
    );
  }

  if (phase === "running") {
    return (
      <Box flexDirection="column">
        <Text bold>Parity — running</Text>
        <Text>Collecting results ({scopeChoice})…</Text>
      </Box>
    );
  }

  const filtered = report
    ? NodeVersionKit_filterSurfaceResults(report.results, { failingOnly })
    : [];
  const rows = NodeVersionKit_surfaceResultsToRows(filtered);
  const transcript =
    report === null
      ? ""
      : emitJson
        ? JSON.stringify(report, null, 2)
        : formatHumanReport(report);

  return (
    <Box
      flexDirection="column"
      {...(screenReader ? { "aria-label": "Parity results" } : {})}
    >
      <Text bold>Parity — result</Text>
      {runError.length > 0 ? <Text color="red">{runError}</Text> : null}
      {report ? (
        <Text color={report.ok ? "green" : "red"}>
          {report.ok ? "OK" : "DRIFT"} (exit {String(report.exitCode)})
        </Text>
      ) : null}
      <Text>
        f — toggle failures-only ({failingOnly ? "on" : "off"}) | b — new run |
        Esc — menu
      </Text>
      <Text> </Text>
      {rows.length > 0 ? (
        <Box flexDirection="column">
          <Text bold>Comparison</Text>
          {rows.slice(0, 40).map((row) => (
            <Text key={`${row.scope}:${row.surface}`} wrap="truncate-end">
              [{row.status}] {row.scope} {row.surface} expected={row.expected}{" "}
              observed={row.observed}
            </Text>
          ))}
          {rows.length > 40 ? (
            <Text dimColor>… {String(rows.length - 40)} more rows</Text>
          ) : null}
        </Box>
      ) : null}
      <Text bold>Transcript</Text>
      <Box height={12} flexDirection="column">
        {transcript
          .split("\n")
          .slice(0, 80)
          .map((line, index) => (
            <Text key={index} wrap="truncate-end">
              {line}
            </Text>
          ))}
      </Box>
    </Box>
  );
}

/**
 * Read-only diagnostics route listing NVM, engines, blueprint, config-dir, and Vercel surface keys.
 */
function DiagnosticsRoute(props: {
  config: NodeVersionKit_InkConfig;
}): React.ReactElement {
  const navigate = useNavigate();
  const screenReader = useIsScreenReaderEnabled();

  useInput((input, key) => {
    if (input === "b" || key.escape) {
      void navigate("/");
    }
  });

  /**
   * Renders a titled bullet list capped at twelve rows with an overflow count when longer.
   */
  const block = (title: string, labels: readonly string[]) => (
    <Box key={title} flexDirection="column" marginBottom={1}>
      <Text bold>{title}</Text>
      {labels.slice(0, 12).map((label) => (
        <Text key={label} dimColor>
          - {label}
        </Text>
      ))}
      {labels.length > 12 ? (
        <Text dimColor>… {String(labels.length - 12)} more</Text>
      ) : null}
    </Box>
  );

  return (
    <Box
      flexDirection="column"
      {...(screenReader ? { "aria-label": "Diagnostics reference" } : {})}
    >
      <Text bold>Diagnostics (read-only reference)</Text>
      <Text>Repo root: {props.config.repoRoot}</Text>
      <Text>Canonical .nvmrc: {props.config.rootNvmrcPath}</Text>
      <Text> </Text>
      {block(
        ".nvmrc surfaces",
        props.config.nvmrcSurfaceDefinitions.map(
          (definition) => definition.label,
        ),
      )}
      {block(
        "package.json engines",
        props.config.packageJsonSurfaceDefinitions.map(
          (definition) => definition.label,
        ),
      )}
      {block(
        "Render blueprint files",
        props.config.renderBlueprintSurfaceDefinitions.map(
          (definition) => definition.label,
        ),
      )}
      {block(
        "Config directories (extra files)",
        props.config.additionalConfigDirectories.map(
          (definition) => definition.label,
        ),
      )}
      {block(
        "Vercel projects",
        props.config.vercelProjectDefinitions.map(
          (definition) => `${definition.teamScope}/${definition.projectName}`,
        ),
      )}
      <Text>b or Esc — back</Text>
    </Box>
  );
}

/**
 * Discriminates configured test launcher UI between command preview, subprocess run, and post-run output review.
 */
type TestsPhase = "preview" | "result" | "running";

/**
 * Configured test route: previews the npm script, runs a subprocess, and tails output.
 *
 * @remarks
 * When `phase` is `running`, effect cleanup terminates the child process on unmount or phase change.
 */
function TestsRoute(props: {
  config: NodeVersionKit_InkConfig;
}): React.ReactElement {
  const { config } = props;
  const navigate = useNavigate();
  const [phase, setPhase] = useState<TestsPhase>("preview");
  const [lines, setLines] = useState<NodeVersionKit_InkCapturedOutputLine[]>(
    [],
  );
  const [exitCode, setExitCode] = useState<number | null>(null);
  const screenReader = useIsScreenReaderEnabled();

  useEffect(() => {
    if (phase !== "running") {
      return;
    }

    setLines([]);
    setExitCode(null);
    const child = spawn("npm", ["run", config.testNpmScriptName], {
      cwd: config.repoRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout?.on("data", (chunk: Buffer) => {
      NodeVersionKitInk_appendCapturedChunk({
        chunk,
        setLines,
        source: "stdout",
      });
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      NodeVersionKitInk_appendCapturedChunk({
        chunk,
        setLines,
        source: "stderr",
      });
    });
    child.once("close", (code) => {
      setExitCode(code);
      setPhase("result");
    });

    return () => {
      child.kill("SIGTERM");
    };
  }, [config.repoRoot, config.testNpmScriptName, phase]);

  useInput((input, key) => {
    if (key.escape) {
      void navigate("/");
      return;
    }
    if (phase === "preview") {
      if (input === "b") {
        void navigate("/");
        return;
      }
      if (input === "r" || key.return) {
        setPhase("running");
      }
      return;
    }
    if (phase === "result" && input === "b") {
      setPhase("preview");
    }
  });

  if (phase === "running" || phase === "result") {
    return (
      <Box
        flexDirection="column"
        {...(screenReader ? { "aria-label": "Test command output" } : {})}
      >
        <Text bold>
          {NodeVersionKit_formatNodeParityTestNpmScript(
            config.testNpmScriptName,
          )}
        </Text>
        {phase === "running" ? <Text>Running…</Text> : null}
        {phase === "result" ? (
          <Text color={exitCode === 0 ? "green" : "red"}>
            Exit {String(exitCode)}
          </Text>
        ) : null}
        <NodeVersionKitInkCapturedOutputBlock
          bracketSource
          lines={lines}
          maxLines={phase === "running" ? 18 : 28}
          title="Output (tail)"
        />
        {phase === "result" ? (
          <Text>b — back to preview | Esc — menu</Text>
        ) : (
          <Text>Wait for completion…</Text>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold>Run configured test command</Text>
      <NodeVersionKitInkCommandPreview
        commandLine={NodeVersionKit_formatNodeParityTestNpmScript(
          config.testNpmScriptName,
        )}
        title="Command"
      />
      <Text> </Text>
      <Text>Enter or r — run | b — menu | Esc — menu</Text>
    </Box>
  );
}

/**
 * Ink router for the node-version parity operator menu, diagnostics, and configured test launcher.
 */
export function NodeVersionKitInkApp(props: {
  config: NodeVersionKit_InkConfig;
  formatHumanReport: NodeVersionKit_FormatHumanReport;
  runCheck: NodeVersionKit_RunCheck;
}): React.ReactElement {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          element={
            <MenuRoute testNpmScriptName={props.config.testNpmScriptName} />
          }
          path="/"
        />
        <Route
          element={
            <ParityRoute
              config={props.config}
              formatHumanReport={props.formatHumanReport}
              runCheck={props.runCheck}
            />
          }
          path="/parity"
        />
        <Route
          element={<DiagnosticsRoute config={props.config} />}
          path="/diagnostics"
        />
        <Route element={<TestsRoute config={props.config} />} path="/tests" />
      </Routes>
    </MemoryRouter>
  );
}
