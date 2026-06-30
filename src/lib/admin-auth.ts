export function authorizeAdmin(request: Request) {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) {
    return "ADMIN_SECRET is not configured on the server.";
  }

  const header = request.headers.get("x-admin-secret");
  if (header !== secret) {
    return "Unauthorized.";
  }

  return null;
}