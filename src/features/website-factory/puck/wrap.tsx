import { useId, type ComponentType, type ReactNode } from "react";
import { boxStyleToCss, type StyleBox } from "./styles";
import {
  hasResponsiveOverrides,
  responsiveStyleSheet,
  stripResponsive,
} from "./responsive";

export function withBoxStyles(
  Component: ComponentType<Record<string, unknown>>,
) {
  return function StyledBlock(
    props: Record<string, unknown> & { styles?: StyleBox; id?: string },
  ) {
    const { styles, id, ...rest } = props;
    const scopeId = typeof id === "string" && id ? id : undefined;
    const baseCss = boxStyleToCss(stripResponsive(styles));
    const needsShell =
      Object.keys(baseCss).length > 0 || hasResponsiveOverrides(styles);
    if (!needsShell) return <Component id={id} {...rest} />;
    return (
      <StyleShell styles={styles} scopeId={scopeId}>
        <Component id={id} {...rest} />
      </StyleShell>
    );
  };
}

export function StyleShell({
  styles,
  children,
  scopeId,
}: {
  styles?: StyleBox;
  children?: ReactNode;
  scopeId?: string;
}) {
  const autoId = useId();
  const id = scopeId || autoId;
  const overrides = hasResponsiveOverrides(styles);
  const baseCss = boxStyleToCss(stripResponsive(styles));

  // When overrides exist, put fully resolved rules in a stylesheet so media
  // queries can win (inline styles would always beat @media rules).
  if (overrides) {
    const sheet = responsiveStyleSheet(id, styles);
    return (
      <>
        {sheet ? (
          <style
            data-ae-responsive={id}
            dangerouslySetInnerHTML={{ __html: sheet }}
          />
        ) : null}
        <div className="wf-style-shell" data-ae-r={id}>
          {children}
        </div>
      </>
    );
  }

  return (
    <div className="wf-style-shell" data-ae-r={id} style={baseCss}>
      {children}
    </div>
  );
}
