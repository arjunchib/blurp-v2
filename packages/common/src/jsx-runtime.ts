// deno-lint-ignore-file ban-types no-explicit-any
export function jsx(tag: Function, props: any) {
  return tag(props);
}

export { jsx as jsxs };

// https://www.typescriptlang.org/docs/handbook/jsx.html#children-type-checking
declare global {
  namespace JSX {
    interface ElementChildrenAttribute {
      children: {}; // specify children name to use
    }
  }
}
