import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Add auth routes for session management
auth.addHttpRoutes(http);

export default http;
