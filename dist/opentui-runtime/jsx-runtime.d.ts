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
    onSelect?: (index: number, option: NodeVersionKit_OpenTuiSelectOption | undefined) => void;
    options: readonly NodeVersionKit_OpenTuiSelectOption[];
    showDescription?: boolean;
};
export declare namespace JSX {
    type Element = import("react").JSX.Element;
    type ElementType = import("react").JSX.ElementType;
    type ElementChildrenAttribute = import("react").JSX.ElementChildrenAttribute;
    type IntrinsicAttributes = import("react").JSX.IntrinsicAttributes;
    interface IntrinsicElements {
        box: NodeVersionKit_OpenTuiContainerProps;
        scrollbox: NodeVersionKit_OpenTuiContainerProps;
        text: NodeVersionKit_OpenTuiTextProps;
        "tab-select": NodeVersionKit_OpenTuiSelectProps;
    }
}
//# sourceMappingURL=jsx-runtime.d.ts.map