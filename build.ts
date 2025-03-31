#!/usr/bin/env bun
import { build, type BuildConfig } from "bun";
import { existsSync, mkdirSync } from "fs";
import { rm } from "fs/promises";
import path from "path";

// Main build function
async function runBuild() {
  console.log("🚀 Starting build process...");

  // Create or clean dist directory
  const distDir = path.join(process.cwd(), "dist");
  if (existsSync(distDir)) {
    console.log("🧹 Cleaning dist directory...");
    await rm(distDir, { recursive: true, force: true });
  }
  mkdirSync(distDir, { recursive: true });

  // Copy index.html
  console.log("📋 Copying index.html...");
  await Bun.write(
    path.join(distDir, "index.html"),
    await Bun.file("./src/index.html").text()
  );

  // Build options for app
  const buildOptions: BuildConfig = {
    entrypoints: ["./src/App.tsx"],
    outdir: distDir,
    naming: "App.js",
    minify: false, // Disable minification for easier debugging
    target: "browser",
    sourcemap: "inline", // Include source maps for debugging
    splitting: false, // Bundle everything into a single file
    external: [
      // External dependencies to be loaded via CDN
      "monaco-editor",
      "monaco-vim"
    ],
    define: {
      // Define global variables for bundling
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development")
    }
  };

  // Build the app
  console.log("📦 Building JavaScript...");
  try {
    const result = await build(buildOptions);
    console.log(`✅ Built ${result.outputs.length} files`);
  } catch (error) {
    console.error("❌ Error building JavaScript:", error);
    process.exit(1);
  }

  console.log("✅ Build complete!");
}

// Run the build
runBuild().catch(err => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});
