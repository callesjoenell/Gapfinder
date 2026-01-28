import { httpRouter } from "convex/server";

const http = httpRouter();

// No auth routes needed - Clerk handles authentication externally

export default http;
