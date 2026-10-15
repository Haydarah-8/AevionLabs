/**
 * Compatibility shim — prefer `@/features/website-factory/registry`.
 */
export {
  getAevionComponent,
  listAevionComponents,
  listAevionCategories,
  listAevionComponentTypes,
  listComponentSchemas,
  isRegisteredComponent,
  componentDocumentationMarkdown,
  registryStats,
  resetAevionRegistryCache,
} from "@/features/website-factory/registry";
export type {
  AevionComponentRecord as AevionComponentDefinition,
  AevionRegistryCategoryId as AevionComponentCategory,
} from "@/features/website-factory/registry";

import { listAevionComponents } from "@/features/website-factory/registry";

/** Eager snapshot for callers that expect an array constant. */
export const AEVION_COMPONENT_REGISTRY = listAevionComponents();
