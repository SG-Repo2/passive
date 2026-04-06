import {
  handleAuditSubmissionRequest,
  methodNotAllowedResponse,
  optionsResponse,
} from "@/lib/audit-submission";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  return handleAuditSubmissionRequest(request);
}

export async function GET() {
  return methodNotAllowedResponse("GET");
}

export async function PUT() {
  return methodNotAllowedResponse("PUT");
}

export async function PATCH() {
  return methodNotAllowedResponse("PATCH");
}

export async function DELETE() {
  return methodNotAllowedResponse("DELETE");
}

export async function OPTIONS() {
  return optionsResponse();
}
