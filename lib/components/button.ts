import { APIButtonComponent, ComponentType } from "../deps.ts";

interface ButtonChildren {
  children: APIButtonComponent["label"];
}

// https://stackoverflow.com/questions/57103834/typescript-omit-a-property-from-all-interfaces-in-a-union-but-keep-the-union-s
type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

type ButtonProps = DistributiveOmit<APIButtonComponent, "label" | "type"> &
  ButtonChildren;

export function Button(props: ButtonProps): APIButtonComponent {
  return {
    ...props,
    type: ComponentType.Button,
    label: props.children,
  };
}
