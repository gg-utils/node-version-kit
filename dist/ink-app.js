import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useEffect, useState } from "react";
import { Box, Text, useApp, useInput, useIsScreenReaderEnabled } from "ink";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { NodeVersionKit_formatNodeParityTestNpmScript, NodeVersionKit_formatNpxCheckParityCommand, } from "./format-commands.js";
import { NodeVersionKit_filterSurfaceResults, NodeVersionKit_surfaceResultsToRows, } from "./report-rows.js";
/** Renders a compact command preview block without depending on root script UI helpers. */
function NodeVersionKitInkCommandPreview(props) {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: props.title }), _jsx(Text, { children: props.commandLine })] }));
}
/** Renders captured subprocess output with optional source labels and tail limiting. */
function NodeVersionKitInkCapturedOutputBlock(props) {
    const visibleLines = props.lines.slice(-props.maxLines);
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: props.title }), visibleLines.length === 0 ? _jsx(Text, { dimColor: true, children: "\u2014" }) : null, visibleLines.map((line, index) => (_jsxs(Text, { wrap: "truncate-end", children: [props.bracketSource ? `[${line.source}] ` : "", line.text] }, `${String(index)}:${line.source}`)))] }));
}
/** Appends split stdout/stderr chunks to a captured-output line buffer. */
function NodeVersionKitInk_appendCapturedChunk(options) {
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
function MenuRoute(props) {
    const navigate = useNavigate();
    const { exit } = useApp();
    const screenReader = useIsScreenReaderEnabled();
    useInput((input, key) => {
        if (input === "1") {
            navigate("/parity");
            return;
        }
        if (input === "2") {
            navigate("/diagnostics");
            return;
        }
        if (input === "3") {
            navigate("/tests");
            return;
        }
        if (input === "q" || key.escape) {
            exit();
        }
    });
    return (_jsxs(Box, { flexDirection: "column", "aria-label": screenReader ? "Node parity main menu" : undefined, children: [_jsx(Text, { bold: true, children: "Node parity (Ink)" }), _jsx(Text, { children: " " }), _jsx(Text, { children: "1 \u2014 Run parity check" }), _jsx(Text, { children: "2 \u2014 Diagnostics (surfaces reference)" }), _jsxs(Text, { children: ["3 \u2014 Run ", props.testNpmScriptName] }), _jsx(Text, { children: "q \u2014 Quit" })] }));
}
/**
 * Parity check wizard: scope and JSON toggles, CLI preview, in-process run, then tabular results.
 *
 * @remarks
 * Effect cleanup sets `cancelled` so late async results from the injected parity runner do not apply after unmount or phase change.
 */
function ParityRoute(props) {
    const { config, formatHumanReport, runCheck } = props;
    const navigate = useNavigate();
    const [phase, setPhase] = useState("scope");
    const [scopeChoice, setScopeChoice] = useState("all");
    const [emitJson, setEmitJson] = useState(false);
    const [report, setReport] = useState(null);
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
                const nextReport = await runCheck({ scopeArg });
                if (!cancelled) {
                    setReport(nextReport);
                    setRunError("");
                    setPhase("result");
                }
            }
            catch (error) {
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
            navigate("/");
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
        return (_jsxs(Box, { flexDirection: "column", "aria-label": screenReader ? "Parity scope selection" : undefined, children: [_jsx(Text, { bold: true, children: "Parity \u2014 scope" }), _jsx(Text, { children: " " }), _jsxs(Text, { children: ["Scope: 1=all 2=static 3=hosted 4=runtime | j=toggle JSON output (", emitJson ? "on" : "off", ")"] }), _jsx(Text, { children: "n or Enter \u2014 continue to preview | Esc \u2014 menu" }), _jsx(Text, { children: " " }), _jsxs(Text, { children: ["Selected: ", scopeChoice, emitJson ? " + JSON" : ""] })] }));
    }
    if (phase === "preview") {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: "Parity \u2014 command preview" }), _jsx(NodeVersionKitInkCommandPreview, { commandLine: commandLine, title: "Canonical CLI" }), _jsx(Text, { children: " " }), _jsx(Text, { children: "Enter or r \u2014 run in-process | b \u2014 back | Esc \u2014 menu" })] }));
    }
    if (phase === "running") {
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: "Parity \u2014 running" }), _jsxs(Text, { children: ["Collecting results (", scopeChoice, ")\u2026"] })] }));
    }
    const filtered = report
        ? NodeVersionKit_filterSurfaceResults(report.results, { failingOnly })
        : [];
    const rows = NodeVersionKit_surfaceResultsToRows(filtered);
    const transcript = report === null
        ? ""
        : emitJson
            ? JSON.stringify(report, null, 2)
            : formatHumanReport(report);
    return (_jsxs(Box, { flexDirection: "column", "aria-label": screenReader ? "Parity results" : undefined, children: [_jsx(Text, { bold: true, children: "Parity \u2014 result" }), runError.length > 0 ? _jsx(Text, { color: "red", children: runError }) : null, report ? (_jsxs(Text, { color: report.ok ? "green" : "red", children: [report.ok ? "OK" : "DRIFT", " (exit ", String(report.exitCode), ")"] })) : null, _jsxs(Text, { children: ["f \u2014 toggle failures-only (", failingOnly ? "on" : "off", ") | b \u2014 new run | Esc \u2014 menu"] }), _jsx(Text, { children: " " }), rows.length > 0 ? (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: "Comparison" }), rows.slice(0, 40).map((row) => (_jsxs(Text, { wrap: "truncate-end", children: ["[", row.status, "] ", row.scope, " ", row.surface, " expected=", row.expected, " ", "observed=", row.observed] }, `${row.scope}:${row.surface}`))), rows.length > 40 ? (_jsxs(Text, { dimColor: true, children: ["\u2026 ", String(rows.length - 40), " more rows"] })) : null] })) : null, _jsx(Text, { bold: true, children: "Transcript" }), _jsx(Box, { height: 12, flexDirection: "column", children: transcript
                    .split("\n")
                    .slice(0, 80)
                    .map((line, index) => (_jsx(Text, { wrap: "truncate-end", children: line }, index))) })] }));
}
/**
 * Read-only diagnostics route listing NVM, engines, blueprint, config-dir, and Vercel surface keys.
 */
function DiagnosticsRoute(props) {
    const navigate = useNavigate();
    const screenReader = useIsScreenReaderEnabled();
    useInput((input, key) => {
        if (input === "b" || key.escape) {
            navigate("/");
        }
    });
    /**
     * Renders a titled bullet list capped at twelve rows with an overflow count when longer.
     */
    const block = (title, labels) => (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, children: title }), labels.slice(0, 12).map((label) => (_jsxs(Text, { dimColor: true, children: ["- ", label] }, label))), labels.length > 12 ? (_jsxs(Text, { dimColor: true, children: ["\u2026 ", String(labels.length - 12), " more"] })) : null] }, title));
    return (_jsxs(Box, { flexDirection: "column", "aria-label": screenReader ? "Diagnostics reference" : undefined, children: [_jsx(Text, { bold: true, children: "Diagnostics (read-only reference)" }), _jsxs(Text, { children: ["Repo root: ", props.config.repoRoot] }), _jsxs(Text, { children: ["Canonical .nvmrc: ", props.config.rootNvmrcPath] }), _jsx(Text, { children: " " }), block(".nvmrc surfaces", props.config.nvmrcSurfaceDefinitions.map((definition) => definition.label)), block("package.json engines", props.config.packageJsonSurfaceDefinitions.map((definition) => definition.label)), block("Render blueprint files", props.config.renderBlueprintSurfaceDefinitions.map((definition) => definition.label)), block("Config directories (extra files)", props.config.additionalConfigDirectories.map((definition) => definition.label)), block("Vercel projects", props.config.vercelProjectDefinitions.map((definition) => `${definition.teamScope}/${definition.projectName}`)), _jsx(Text, { children: "b or Esc \u2014 back" })] }));
}
/**
 * Configured test route: previews the npm script, runs a subprocess, and tails output.
 *
 * @remarks
 * When `phase` is `running`, effect cleanup terminates the child process on unmount or phase change.
 */
function TestsRoute(props) {
    const { config } = props;
    const navigate = useNavigate();
    const [phase, setPhase] = useState("preview");
    const [lines, setLines] = useState([]);
    const [exitCode, setExitCode] = useState(null);
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
        child.stdout?.on("data", (chunk) => {
            NodeVersionKitInk_appendCapturedChunk({
                chunk,
                setLines,
                source: "stdout",
            });
        });
        child.stderr?.on("data", (chunk) => {
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
            navigate("/");
            return;
        }
        if (phase === "preview") {
            if (input === "b") {
                navigate("/");
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
        return (_jsxs(Box, { flexDirection: "column", "aria-label": screenReader ? "Test command output" : undefined, children: [_jsx(Text, { bold: true, children: NodeVersionKit_formatNodeParityTestNpmScript(config.testNpmScriptName) }), phase === "running" ? _jsx(Text, { children: "Running\u2026" }) : null, phase === "result" ? (_jsxs(Text, { color: exitCode === 0 ? "green" : "red", children: ["Exit ", String(exitCode)] })) : null, _jsx(NodeVersionKitInkCapturedOutputBlock, { bracketSource: true, lines: lines, maxLines: phase === "running" ? 18 : 28, title: "Output (tail)" }), phase === "result" ? (_jsx(Text, { children: "b \u2014 back to preview | Esc \u2014 menu" })) : (_jsx(Text, { children: "Wait for completion\u2026" }))] }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { bold: true, children: "Run configured test command" }), _jsx(NodeVersionKitInkCommandPreview, { commandLine: NodeVersionKit_formatNodeParityTestNpmScript(config.testNpmScriptName), title: "Command" }), _jsx(Text, { children: " " }), _jsx(Text, { children: "Enter or r \u2014 run | b \u2014 menu | Esc \u2014 menu" })] }));
}
/**
 * Ink router for the node-version parity operator menu, diagnostics, and configured test launcher.
 */
export function NodeVersionKitInkApp(props) {
    return (_jsx(MemoryRouter, { initialEntries: ["/"], children: _jsxs(Routes, { children: [_jsx(Route, { element: _jsx(MenuRoute, { testNpmScriptName: props.config.testNpmScriptName }), path: "/" }), _jsx(Route, { element: _jsx(ParityRoute, { config: props.config, formatHumanReport: props.formatHumanReport, runCheck: props.runCheck }), path: "/parity" }), _jsx(Route, { element: _jsx(DiagnosticsRoute, { config: props.config }), path: "/diagnostics" }), _jsx(Route, { element: _jsx(TestsRoute, { config: props.config }), path: "/tests" })] }) }));
}
//# sourceMappingURL=ink-app.js.map