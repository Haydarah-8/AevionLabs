import type { ComponentType, ReactNode } from "react";
import { boxStyleToCss, type StyleBox } from "./styles";

export function withBoxStyles(
  Component: ComponentType<Record<string, unknown>>,
) {
  return function StyledBlock(
    props: Record<string, unknown> & { styles?: StyleBox },
  ) {
    const { styles, ...rest } = props;
    const style = boxStyleToCss(styles);
    const hasStyle = Object.keys(style).length > 0;
    if (!hasStyle) return <Component {...rest} />;
    return (
      <div className="wf-style-shell" style={style}>
        <Component {...rest} />
      </div>
    );
  };
}

export function StyleShell({
  styles,
  children,
}: {
  styles?: StyleBox;
  children?: ReactNode;
}) {
  return (
    <div className="wf-style-shell" style={boxStyleToCss(styles)}>
      {children}
    </div>
  );
}
