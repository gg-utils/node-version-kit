export { jsx, jsxs, Fragment } from "react/jsx-runtime";
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

// TypeScript requires the JSX namespace to describe this terminal renderer.
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
    export type Element = import("react").JSX.Element;
    export type ElementType = import("react").JSX.ElementType;
    export type ElementChildrenAttribute = import("react").JSX.ElementChildrenAttribute;
    export type IntrinsicAttributes = import("react").JSX.IntrinsicAttributes;
    export interface IntrinsicElements {
      box: NodeVersionKit_OpenTuiContainerProps;
      scrollbox: NodeVersionKit_OpenTuiContainerProps;
      text: NodeVersionKit_OpenTuiTextProps;
      "tab-select": NodeVersionKit_OpenTuiSelectProps;
    }
  }
