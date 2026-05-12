import { NextRequest } from "next/server";
import { getCurrentUser, SessionPayload } from "@/lib/auth";
import { unauthorized, forbidden } from "@/lib/response";

type Handler = (
  req: NextRequest,
  context: { user: SessionPayload; params?: Record<string, string> }
) => Promise<Response>;

// any logged-in user can pass through
export function withAuth(handler: Handler) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>> }
  ) => {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    const params = await ctx.params;
    return handler(req, { user, params });
  };
}

// admin-only routes — everyone else gets a 403
export function withAdmin(handler: Handler) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>> }
  ) => {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (user.role !== "ADMIN") return forbidden();
    const params = await ctx.params;
    return handler(req, { user, params });
  };
}

// members (and admins) only
export function withMember(handler: Handler) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>> }
  ) => {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (user.role !== "MEMBER" && user.role !== "ADMIN") return forbidden();
    const params = await ctx.params;
    return handler(req, { user, params });
  };
}

// trainers (and admins) only
export function withTrainer(handler: Handler) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>> }
  ) => {
    const user = await getCurrentUser(req);
    if (!user) return unauthorized();
    if (user.role !== "TRAINER" && user.role !== "ADMIN") return forbidden();
    const params = await ctx.params;
    return handler(req, { user, params });
  };
}