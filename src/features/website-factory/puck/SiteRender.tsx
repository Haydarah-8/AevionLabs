"use client";

import { Render } from "@puckeditor/core";
import { factoryConfig } from "./config";
import type { PuckData } from "../types";

export function SiteRender({ data }: { data: PuckData }) {
  return <Render config={factoryConfig} data={data} />;
}
