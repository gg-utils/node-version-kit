/**
 * @fileoverview Augments React JSX intrinsic elements with OpenTUI terminal widget tags (`box`,
 * `scrollbox`, `text`, `tab-select`) and their prop contracts for `@gg-utils/node-version-kit` OpenTUI screens.
 *
 * This file owns ambient JSX augmentation on the global namespace plus `react` and
 * `react/jsx-runtime` so TypeScript accepts OpenTUI markup alongside standard React element typing.
 * Flow: OpenTUI TSX -> intrinsic tag names -> narrowed props for layout, text styling, and option lists.
 *
 * @example
 * ```typescript
 * import type { ReactElement } from "react";
 *
 * export function NodeVersionKit_OpenTuiSampleRoot(): ReactElement {
 *   return (
 *     <box style={{ flexDirection: "column", gap: 1 }}>
 *       <text bold style={{ fg: "cyan" }}>Node version kit</text>
 *       <tab-select
 *         options={[{ name: "Parity", value: "parity", description: "Run parity checks" }]}
 *         onSelect={() => {}}
 *       />
 *     </box>
 *   );
 * }
 * ```
 *
 * @testing CLI: cd packages/node-version-kit && npm run type-check
 *
 * @see packages/node-version-kit/src/opentui-app.tsx - OpenTUI parity panel whose TSX consumes these intrinsic elements for menus, scroll regions, and tabbed selects.
 * @see docs/TYPESCRIPT_STANDARDS_DOCUMENTATION_FILE_OVERVIEWS.md - Repository file-overview standard this declaration header follows for audits and agent orientation.
 * @documentation reviewed=2026-05-22 standard=FILE_OVERVIEW_STANDARDS_TYPESCRIPT@3
 */

import type { Key, ReactNode } from "react";

type NodeVersionKit_OpenTuiSelectOption = {
  readonly description: string;
  readonly name: string;
  readonly value: string;
};

type NodeVersionKit_OpenTuiFlexDirection = "column" | "row";

type NodeVersionKit_OpenTuiStyle = {
  flexDirection?: NodeVersionKit_OpenTuiFlexDirection;
  flexGrow?: number;
  gap?: number;
  maxHeight?: number;
  padding?: number;
  fg?: string;
};

type NodeVersionKit_OpenTuiContainerProps = {
  children?: ReactNode;
  key?: Key;
  style?: NodeVersionKit_OpenTuiStyle;
};

type NodeVersionKit_OpenTuiTextProps = {
  bold?: boolean;
  children?: ReactNode;
  key?: Key;
  style?: NodeVersionKit_OpenTuiStyle;
};

type NodeVersionKit_OpenTuiSelectProps = {
  key?: Key;
  onSelect?: (
    index: number,
    option: NodeVersionKit_OpenTuiSelectOption | undefined,
  ) => void;
  options: readonly NodeVersionKit_OpenTuiSelectOption[];
  showDescription?: boolean;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      box: NodeVersionKit_OpenTuiContainerProps;
      scrollbox: NodeVersionKit_OpenTuiContainerProps;
      text: NodeVersionKit_OpenTuiTextProps;
      "tab-select": NodeVersionKit_OpenTuiSelectProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      box: NodeVersionKit_OpenTuiContainerProps;
      scrollbox: NodeVersionKit_OpenTuiContainerProps;
      text: NodeVersionKit_OpenTuiTextProps;
      "tab-select": NodeVersionKit_OpenTuiSelectProps;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      box: NodeVersionKit_OpenTuiContainerProps;
      scrollbox: NodeVersionKit_OpenTuiContainerProps;
      text: NodeVersionKit_OpenTuiTextProps;
      "tab-select": NodeVersionKit_OpenTuiSelectProps;
    }
  }
}

export {};
