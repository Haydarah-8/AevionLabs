import type { Config } from "@puckeditor/core";
import { factoryConfig } from "@/features/website-factory/puck/config";
import {
  getInstanceVariant,
  getLayerLabel,
  isLayerHidden,
  isLayerLocked,
  locksChildren,
} from "@/features/website-factory/editor/studio-props";
import {
  interactionClassNames,
  readInteractions,
} from "@/features/website-factory/editor/interactions";
import { applyFieldBinds } from "@/features/website-factory/cms/bindings";
import { useCmsContext } from "@/features/website-factory/cms/CmsContext";
import type { ReactNode } from "react";

type AnyComponentDef = {
  render?: (props: Record<string, unknown>) => ReactNode;
  resolvePermissions?: (
    data: { props?: Record<string, unknown> },
    params: {
      permissions: Record<string, boolean | undefined>;
    },
  ) =>
    | Record<string, boolean | undefined>
    | Promise<Record<string, boolean | undefined>>;
  [key: string]: unknown;
};

function StudioShell({
  children,
  hidden,
  locked,
  lockChildren,
  isEditing,
  label,
  variant,
  type,
  interactionClass,
  hover,
  click,
  appear,
}: {
  children: ReactNode;
  hidden?: boolean;
  locked?: boolean;
  lockChildren?: boolean;
  isEditing?: boolean;
  label?: string;
  variant?: string;
  type: string;
  interactionClass?: string;
  hover?: string;
  click?: string;
  appear?: string;
}) {
  if (hidden && !isEditing) return null;
  const className = [
    "ae-block-shell",
    hidden ? "is-hidden" : "",
    locked ? "is-locked" : "",
    interactionClass || "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      className={className}
      data-ae-type={type}
      data-ae-layer-label={label || undefined}
      data-ae-locked={locked ? "true" : undefined}
      data-ae-hidden={hidden ? "true" : undefined}
      data-ae-lock-children={lockChildren ? "true" : undefined}
      data-ae-variant={variant || undefined}
      data-ae-hover={hover || undefined}
      data-ae-click={click || undefined}
      data-ae-appear={appear || undefined}
    >
      {children}
    </div>
  );
}

function BoundRender({
  type,
  props,
  previousRender,
}: {
  type: string;
  props: Record<string, unknown>;
  previousRender?: (props: Record<string, unknown>) => ReactNode;
}) {
  const ctx = useCmsContext();
  const resolved = applyFieldBinds(props, ctx);
  const puck = resolved.puck as { isEditing?: boolean } | undefined;
  const isEditing = Boolean(puck?.isEditing ?? resolved.editMode);
  const hidden = isLayerHidden(resolved);
  const locked = isLayerLocked(resolved);
  const lockChildrenFlag = locksChildren(resolved);
  const label = getLayerLabel(type, resolved);
  const variant = getInstanceVariant(resolved) || undefined;
  const interactions = readInteractions(resolved);
  const node = previousRender ? previousRender(resolved) : null;
  return (
    <StudioShell
      type={type}
      hidden={hidden}
      locked={locked}
      lockChildren={lockChildrenFlag}
      isEditing={isEditing}
      label={label}
      variant={variant}
      interactionClass={interactionClassNames(interactions)}
      hover={interactions.hover}
      click={interactions.click}
      appear={interactions.appear}
    >
      {node}
    </StudioShell>
  );
}

/**
 * Augment Puck config with instance flags, CMS field binds, lock permissions.
 */
export function withStudioConfig(
  config: typeof factoryConfig = factoryConfig,
): typeof factoryConfig {
  const components = Object.fromEntries(
    Object.entries(config.components as Record<string, AnyComponentDef>).map(
      ([type, def]) => {
        const previousRender = def.render;
        const previousResolve = def.resolvePermissions;

        return [
          type,
          {
            ...def,
            resolvePermissions: (
              data: { props?: Record<string, unknown> },
              params: {
                permissions: Record<string, boolean | undefined>;
              },
            ) => {
              const run = async () => {
                const inherited = previousResolve
                  ? await previousResolve(data, params)
                  : params.permissions;
                if (isLayerLocked(data.props)) {
                  return {
                    ...inherited,
                    drag: false,
                    delete: false,
                    duplicate: false,
                    edit: false,
                  };
                }
                return inherited;
              };
              return run();
            },
            render: (props: Record<string, unknown>) => (
              <BoundRender
                type={type}
                props={props}
                previousRender={previousRender}
              />
            ),
          },
        ];
      },
    ),
  );

  return {
    ...config,
    components,
  } as typeof factoryConfig & Config;
}
