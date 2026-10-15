"use client";

import { Render } from "@puckeditor/core";
import { factoryConfig } from "./config";
import { withStudioConfig } from "@/features/website-factory/editor/withStudioConfig";
import { CmsProvider } from "@/features/website-factory/cms/CmsContext";
import { listCollections } from "@/features/website-factory/cms/collections";
import type { PuckData, SiteConfig } from "../types";
import type { BindContext } from "@/features/website-factory/cms/bindings";

const studioConfig = withStudioConfig(factoryConfig);

export function SiteRender({
  data,
  siteConfig,
  business,
}: {
  data: PuckData;
  siteConfig?: SiteConfig | null;
  business?: BindContext["business"];
}) {
  return (
    <CmsProvider
      collections={listCollections(siteConfig)}
      business={business}
    >
      <Render config={studioConfig} data={data} />
    </CmsProvider>
  );
}
