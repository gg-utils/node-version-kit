import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "@gg-utils/node-version-kit/opentui-runtime/jsx-runtime";
/** @jsxImportSource @gg-utils/node-version-kit/opentui-runtime */
/**
 * @fileoverview Renders the OpenTUI parity panel with command preview and report rows.
 *
 * This component owns the OpenTUI experience for selecting a scope and viewing the parity result.
 *
 * Flow: scope selection and launch options -> preview command -> report rows and result state.
 *
 * @testing CLI manual: npx tsx root OpenTUI entrypoint; verify the parity panel renders and exits cleanly.
 * @see root OpenTUI entrypoint - Boots the OpenTUI renderer that mounts this component.
 * @see packages/node-version-kit/src/format-commands.ts - Supplies the command preview strings.
 * @see packages/node-version-kit/src/report-rows.ts - Supplies the table rows rendered here.
 * @documentation reviewed=2026-04-11 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */
import { spawn } from "node:child_process";
import { useEffect, useState } from "react";
import { NodeVersionKit_formatNodeParityTestNpmScript, NodeVersionKit_formatNpxCheckParityCommand, } from "./format-commands.js";
import { NodeVersionKit_filterSurfaceResults, NodeVersionKit_surfaceResultsToRows, } from "./report-rows.js";
/**
 * Root menu options for the tab-select, including parity, diagnostics, tests, and the quit sentinel.
 */
function menuOptions() {
    return [
        {
            description: "Static, hosted, runtime parity",
            name: "Parity",
            value: "parity",
        },
        {
            description: "Surface lists (no API calls)",
            name: "Diagnostics",
            value: "diagnostics",
        },
        {
            description: "Configured parity test suite",
            name: "Tests",
            value: "tests",
        },
        { description: "Exit", name: "Quit", value: "quit" },
    ];
}
/**
 * Parity scope choices surfaced in tab-select; values align with the injected parity runner scope arguments.
 */
function parityScopeOptions() {
    return [
        { description: "All scopes", name: "all", value: "all" },
        { description: "Repo files only", name: "static", value: "static" },
        { description: "Vercel + Render", name: "hosted", value: "hosted" },
        {
            description: "Shell + local processes",
            name: "runtime",
            value: "runtime",
        },
    ];
}
/** Narrows a root-menu tab value to a parity-console flow other than the root menu. */
function isNonMenuFlow(value) {
    return value === "parity" || value === "diagnostics" || value === "tests";
}
/** Narrows a parity scope tab value to the `NodeParity_runCheck` scope union. */
function isNodeParityUiScopeChoice(value) {
    return (value === "all" ||
        value === "static" ||
        value === "hosted" ||
        value === "runtime");
}
/** Runs the in-process parity check and records success, drift, or failure on the parity phase. */
async function nodeParityOpenTui_runParityCheckWhenRunning(options) {
    try {
        const scopeArg = options.scopeChoice === "all" ? undefined : options.scopeChoice;
        const nextReport = await options.runCheck(scopeArg === undefined ? {} : { scopeArg });
        if (!options.isCancelled()) {
            options.setReport(nextReport);
            options.setParityError("");
            options.setParityPhase("result");
        }
    }
    catch (error) {
        if (!options.isCancelled()) {
            options.setParityError(error instanceof Error ? error.message : String(error));
            options.setReport(null);
            options.setParityPhase("result");
        }
    }
}
/** Subscribes parity checks for the running phase with cooperative cancellation on unmount. */
function nodeParityOpenTui_subscribeParityRunningEffect(options) {
    if (options.flow !== "parity" || options.parityPhase !== "running") {
        return;
    }
    let cancelled = false;
    void nodeParityOpenTui_runParityCheckWhenRunning({
        isCancelled: () => cancelled,
        runCheck: options.runCheck,
        scopeChoice: options.scopeChoice,
        setParityError: options.setParityError,
        setParityPhase: options.setParityPhase,
        setReport: options.setReport,
    });
    return () => {
        cancelled = true;
    };
}
/** Spawns the configured parity test npm script, mirrors stdout/stderr into React state, and wires cleanup. */
function nodeParityOpenTui_startTestsSpawn(options) {
    options.setTestStdout("");
    options.setTestStderr("");
    options.setTestExit(null);
    const child = spawn("npm", ["run", options.config.testNpmScriptName], {
        cwd: options.config.repoRoot,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
        options.setTestStdout(stdout);
    });
    child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
        options.setTestStderr(stderr);
    });
    child.once("close", (code) => {
        options.setTestExit(code);
        options.setTestsPhase("result");
    });
    return {
        dispose: () => {
            child.kill("SIGTERM");
        },
    };
}
/** Applies root menu tab-select choices to flow transitions or SIGINT quit. */
function handleMenuSelect(_index, option, deps) {
    const value = option?.value;
    if (value === "quit") {
        process.kill(process.pid, "SIGINT");
    }
    if (isNonMenuFlow(value)) {
        deps.setFlow(value);
        if (value === "parity") {
            deps.setParityPhase("form");
        }
        if (value === "tests") {
            deps.setTestsPhase("preview");
        }
    }
}
/** Applies parity scope tab-select choices to the active `NodeParity_runCheck` scope. */
function handleParityScopeSelect(_index, option, setScopeChoice) {
    const value = option?.value;
    if (isNodeParityUiScopeChoice(value)) {
        setScopeChoice(value);
    }
}
/** Applies parity form tab-select choices for JSON toggling, preview navigation, or returning home. */
function handleParityFormActionsSelect(_index, option, deps) {
    if (option?.value === "toggle-json") {
        deps.setEmitJson((previous) => !previous);
    }
    if (option?.value === "preview") {
        deps.setParityPhase("preview");
    }
    if (option?.value === "menu") {
        deps.setFlow("menu");
    }
}
/** Applies parity preview tab-select choices to run the check or return to the form. */
function handleParityPreviewSelect(_index, option, setParityPhase) {
    if (option?.value === "run") {
        setParityPhase("running");
    }
    if (option?.value === "back") {
        setParityPhase("form");
    }
}
/** Applies parity result tab-select choices for failure filtering, reruns, or returning home. */
function handleParityResultSelect(_index, option, deps) {
    if (option?.value === "fail-toggle") {
        deps.setFailingOnly((previous) => !previous);
    }
    if (option?.value === "again") {
        deps.setParityPhase("form");
        deps.setReport(null);
        deps.setParityError("");
    }
    if (option?.value === "menu") {
        deps.setFlow("menu");
    }
}
/** Returns from diagnostics to the root menu when the operator chooses Menu. */
function handleDiagnosticsMenuSelect(_index, option, setFlow) {
    if (option?.value === "menu") {
        setFlow("menu");
    }
}
/** Applies tests preview tab-select choices to spawn the configured test command or return to the root menu. */
function handleTestsPreviewSelect(_index, option, deps) {
    if (option?.value === "run") {
        deps.setTestsPhase("running");
    }
    if (option?.value === "menu") {
        deps.setFlow("menu");
    }
}
/** Applies tests result tab-select choices to rerun from preview or return home. */
function handleTestsResultSelect(_index, option, deps) {
    if (option?.value === "preview") {
        deps.setTestsPhase("preview");
    }
    if (option?.value === "menu") {
        deps.setFlow("menu");
    }
}
/** Builds the filtered comparison table text for parity result scrollboxes. */
function nodeParityOpenTui_formatComparisonPlainText(options) {
    if (options.report === null) {
        return "";
    }
    return NodeVersionKit_surfaceResultsToRows(NodeVersionKit_filterSurfaceResults(options.report.results, {
        failingOnly: options.failingOnly,
    }))
        .map((row) => `[${row.status}] ${row.scope} ${row.surface} expected=${row.expected} observed=${row.observed}`)
        .join("\n");
}
/** Builds the human-readable or JSON transcript shown after a parity run completes. */
function nodeParityOpenTui_formatParityTranscript(options) {
    if (options.report === null) {
        return "";
    }
    if (options.emitJson) {
        return JSON.stringify(options.report, null, 2);
    }
    return options.formatHumanReport(options.report);
}
/** Builds the diagnostics route map copy, including the live parity command preview line. */
function nodeParityOpenTui_formatRouteMapText(options) {
    return [
        "Screen map (this UI → engine / CLI)",
        "menu — local state",
        "parity/form — local state",
        `parity/preview — shows: ${options.commandLine}`,
        "parity/running — in-process configured parity runner",
        `tests/preview — shows: ${NodeVersionKit_formatNodeParityTestNpmScript(options.config.testNpmScriptName)}`,
        `tests/running — spawn ${NodeVersionKit_formatNodeParityTestNpmScript(options.config.testNpmScriptName)} (Node subprocess)`,
    ].join("\n");
}
/** Renders the OpenTUI tree for every flow while keeping orchestration hooks in `NodeParityOpenTuiApp`. */
function NodeVersionKitOpenTuiMainLayout(props) {
    const { commandLine, config, comparisonText, emitJson, flow, parityError, parityPhase, report, routeMapText, scopeChoice, setEmitJson, setFlow, setFailingOnly, setParityError, setParityPhase, setReport, setScopeChoice, setTestsPhase, testExit, testStderr, testStdout, testsPhase, transcript, } = props;
    return (_jsxs("box", { style: { flexDirection: "column", flexGrow: 1, gap: 1, padding: 1 }, children: [_jsx("text", { children: "node-version parity (OpenTUI) \u2014 run from repo root; host runtime is Bun." }), flow === "menu" ? (_jsxs(_Fragment, { children: [_jsx("text", { children: "Select a flow (Tab / arrows, Enter)." }), _jsx("tab-select", { onSelect: (_index, option) => handleMenuSelect(_index, option, {
                            setFlow,
                            setParityPhase,
                            setTestsPhase,
                        }), options: menuOptions(), showDescription: true })] })) : null, flow === "parity" && parityPhase === "form" ? (_jsxs(_Fragment, { children: [_jsx("text", { children: "Parity \u2014 choose scope" }), _jsx("tab-select", { onSelect: (_i, option) => handleParityScopeSelect(_i, option, setScopeChoice), options: parityScopeOptions(), showDescription: true }), _jsxs("text", { children: ["JSON result transcript: ", emitJson ? "yes" : "no", " (use Toggle JSON below)"] }), _jsx("tab-select", { onSelect: (_i, option) => handleParityFormActionsSelect(_i, option, {
                            setEmitJson,
                            setFlow,
                            setParityPhase,
                        }), options: [
                            {
                                description: "Continue to command preview",
                                name: "Preview",
                                value: "preview",
                            },
                            {
                                description: "Emit JSON in result view",
                                name: "Toggle JSON",
                                value: "toggle-json",
                            },
                            { description: "Back", name: "Menu", value: "menu" },
                        ], showDescription: true })] })) : null, flow === "parity" && parityPhase === "preview" ? (_jsxs(_Fragment, { children: [_jsx("text", { children: "Command preview" }), _jsx("scrollbox", { style: { flexGrow: 1, maxHeight: 8 }, children: _jsx("text", { children: commandLine }) }), _jsx("tab-select", { onSelect: (_i, option) => handleParityPreviewSelect(_i, option, setParityPhase), options: [
                            {
                                description: "Run in-process check",
                                name: "Run",
                                value: "run",
                            },
                            { description: "Edit scope", name: "Back", value: "back" },
                        ], showDescription: true })] })) : null, flow === "parity" && parityPhase === "running" ? (_jsxs("text", { children: ["Running parity (", scopeChoice, ")\u2026"] })) : null, flow === "parity" && parityPhase === "result" ? (_jsxs(_Fragment, { children: [parityError.length > 0 ? _jsx("text", { children: parityError }) : null, report ? (_jsxs("text", { children: [report.ok ? "OK" : "DRIFT", " exit=", String(report.exitCode)] })) : null, _jsx("tab-select", { onSelect: (_i, option) => handleParityResultSelect(_i, option, {
                            setFailingOnly,
                            setFlow,
                            setParityError,
                            setParityPhase,
                            setReport,
                        }), options: [
                            {
                                description: "Limit rows to failing surfaces",
                                name: "Toggle failures-only",
                                value: "fail-toggle",
                            },
                            { description: "New run", name: "Again", value: "again" },
                            { description: "Main menu", name: "Menu", value: "menu" },
                        ], showDescription: true }), _jsx("text", { children: "Comparison (filtered)" }), _jsx("scrollbox", { style: { flexGrow: 1, maxHeight: 10 }, children: _jsx("text", { children: comparisonText.length > 0 ? comparisonText : "—" }) }), _jsx("text", { children: "Transcript" }), _jsx("scrollbox", { style: { flexGrow: 1, maxHeight: 12 }, children: _jsx("text", { children: transcript.length > 0 ? transcript : "—" }) })] })) : null, flow === "diagnostics" ? (_jsxs(_Fragment, { children: [_jsx("text", { children: "Diagnostics" }), _jsx("text", { children: routeMapText }), _jsx("text", { children: " " }), _jsxs("text", { children: ["Root: ", config.repoRoot] }), _jsxs("text", { children: [".nvmrc: ", config.rootNvmrcPath] }), _jsx("scrollbox", { style: { flexGrow: 1 }, children: _jsxs("box", { style: { flexDirection: "column", gap: 0 }, children: [_jsxs("text", { children: [".nvmrc:", " ", config.nvmrcSurfaceDefinitions.map((d) => d.label).join(", ")] }), _jsxs("text", { children: ["package.json:", " ", config.packageJsonSurfaceDefinitions
                                            .map((d) => d.label)
                                            .join(", ")] }), _jsxs("text", { children: ["Render Blueprints:", " ", config.renderBlueprintSurfaceDefinitions
                                            .map((d) => d.label)
                                            .join(", ")] }), _jsxs("text", { children: ["extra dirs:", " ", config.additionalConfigDirectories
                                            .map((d) => d.label)
                                            .join(", ")] }), _jsxs("text", { children: ["Vercel:", " ", config.vercelProjectDefinitions
                                            .map((d) => `${d.teamScope}/${d.projectName}`)
                                            .join(", ")] })] }) }), _jsx("tab-select", { onSelect: (_i, option) => handleDiagnosticsMenuSelect(_i, option, setFlow), options: [{ description: "Return", name: "Menu", value: "menu" }], showDescription: true })] })) : null, flow === "tests" && testsPhase === "preview" ? (_jsxs(_Fragment, { children: [_jsx("text", { children: NodeVersionKit_formatNodeParityTestNpmScript(config.testNpmScriptName) }), _jsx("tab-select", { onSelect: (_i, option) => handleTestsPreviewSelect(_i, option, { setFlow, setTestsPhase }), options: [
                            {
                                description: "Spawn configured test script",
                                name: "Run",
                                value: "run",
                            },
                            { description: "Back", name: "Menu", value: "menu" },
                        ], showDescription: true })] })) : null, flow === "tests" && testsPhase === "running" ? (_jsx("text", { children: "Running test script\u2026" })) : null, flow === "tests" && testsPhase === "result" ? (_jsxs(_Fragment, { children: [_jsxs("text", { children: ["Exit ", String(testExit)] }), _jsx("scrollbox", { style: { flexGrow: 1, maxHeight: 14 }, children: _jsxs("box", { style: { flexDirection: "column", gap: 0 }, children: [_jsx("text", { children: testStdout || "—" }), _jsx("text", { children: testStderr || "" })] }) }), _jsx("tab-select", { onSelect: (_i, option) => handleTestsResultSelect(_i, option, { setFlow, setTestsPhase }), options: [
                            { description: "Run again", name: "Preview", value: "preview" },
                            { description: "Main menu", name: "Menu", value: "menu" },
                        ], showDescription: true })] })) : null] }));
}
/**
 * OpenTUI parity console for scope selection, hosted/runtime checks, diagnostics tables, and test runners.
 */
export function NodeVersionKitOpenTuiApp(props) {
    const { config, formatHumanReport, runCheck } = props;
    const [flow, setFlow] = useState("menu");
    const [parityPhase, setParityPhase] = useState("form");
    const [testsPhase, setTestsPhase] = useState("preview");
    const [scopeChoice, setScopeChoice] = useState("all");
    const [emitJson, setEmitJson] = useState(false);
    const [report, setReport] = useState(null);
    const [parityError, setParityError] = useState("");
    const [failingOnly, setFailingOnly] = useState(false);
    const [testStdout, setTestStdout] = useState("");
    const [testStderr, setTestStderr] = useState("");
    const [testExit, setTestExit] = useState(null);
    useEffect(() => {
        return nodeParityOpenTui_subscribeParityRunningEffect({
            flow,
            runCheck,
            parityPhase,
            scopeChoice,
            setParityError,
            setParityPhase,
            setReport,
        });
    }, [flow, parityPhase, runCheck, scopeChoice]);
    useEffect(() => {
        if (flow !== "tests" || testsPhase !== "running") {
            return;
        }
        const { dispose } = nodeParityOpenTui_startTestsSpawn({
            config,
            setTestExit,
            setTestStderr,
            setTestStdout,
            setTestsPhase,
        });
        return dispose;
    }, [config, flow, testsPhase]);
    const commandLine = NodeVersionKit_formatNpxCheckParityCommand({
        checkParityScriptPath: config.checkParityScriptPath,
        json: emitJson,
        scope: scopeChoice,
    });
    const comparisonText = nodeParityOpenTui_formatComparisonPlainText({
        failingOnly,
        report,
    });
    const transcript = nodeParityOpenTui_formatParityTranscript({
        emitJson,
        formatHumanReport,
        report,
    });
    const routeMapText = nodeParityOpenTui_formatRouteMapText({
        commandLine,
        config,
    });
    return (_jsx(NodeVersionKitOpenTuiMainLayout, { commandLine: commandLine, config: config, comparisonText: comparisonText, emitJson: emitJson, flow: flow, parityError: parityError, parityPhase: parityPhase, report: report, routeMapText: routeMapText, scopeChoice: scopeChoice, setEmitJson: setEmitJson, setFlow: setFlow, setFailingOnly: setFailingOnly, setParityError: setParityError, setParityPhase: setParityPhase, setReport: setReport, setScopeChoice: setScopeChoice, setTestsPhase: setTestsPhase, testExit: testExit, testStderr: testStderr, testStdout: testStdout, testsPhase: testsPhase, transcript: transcript }));
}
//# sourceMappingURL=opentui-app.js.map