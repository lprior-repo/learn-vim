#!/usr/bin/env bun
import { serve } from "bun";
import { existsSync } from "fs";
import path from "path";

// Define MIME types for common file extensions
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".map": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

// Get MIME type for a file path
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

// Server configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const IS_DEV = process.env.NODE_ENV !== "production";

// Function to try serving a file from a directory
function tryServeFile(pathname: string, baseDir: string) {
  const filePath = path.join(baseDir, pathname.startsWith("/") ? pathname.slice(1) : pathname);
  
  if (existsSync(filePath)) {
    const contentType = getMimeType(filePath);
    if (IS_DEV) {
      console.log(`Serving ${pathname} from ${baseDir} with content type: ${contentType}`);
    }
    return new Response(Bun.file(filePath), { headers: { "Content-Type": contentType } });
  }
  
  return null;
}

// Start server
const server = serve({
  port: PORT,
  development: IS_DEV,
  fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Default to index.html for root
    if (pathname === "/" || pathname === "") {
      pathname = "/index.html";
    }

    // Serve index.html
    if (pathname === "/index.html") {
      return new Response(Bun.file("./dist/index.html"), {
        headers: { "Content-Type": "text/html" }
      });
    }

    // Try to serve from dist directory first
    const distResponse = tryServeFile(pathname, path.join(process.cwd(), "dist"));
    if (distResponse) return distResponse;
    
    // Fallback to serving from current directory
    const rootResponse = tryServeFile(pathname, process.cwd());
    if (rootResponse) return rootResponse;

    // For any other path without extension, serve index.html (SPA style)
    if (!pathname.includes(".")) {
      return new Response(Bun.file("./dist/index.html"), {
        headers: { "Content-Type": "text/html" }
      });
    }

    // 404 if nothing found
    return new Response("Not found", { status: 404 });
  }
});

console.log(`Monaco Editor Demo running at http://localhost:${server.port}`);
