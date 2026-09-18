import { NextRequest } from "next/server";
import { handleLiveGet, handleLivePost } from "./live-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  return handleLiveGet(request);
}

export async function POST(request: NextRequest) {
  return handleLivePost(request);
}
