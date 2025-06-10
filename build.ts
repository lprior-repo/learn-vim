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

  // Copy index.html (temporarily)
  console.log("📋 Preparing index.html...");
  const htmlContent = await Bun.file("./src/index.html").text();

  // Process CSS with Tailwind
  console.log("🎨 Processing CSS with Tailwind...");
  try {
    const tailwindcss = require("tailwindcss");
    const postcss = require("postcss");
    const autoprefixer = require("autoprefixer");
    
    const css = await Bun.file("./src/index.css").text();
    const result = await postcss([
      tailwindcss,
      autoprefixer
    ]).process(css, {
      from: "./src/index.css",
      to: "./dist/index.css"
    });
    
    await Bun.write(path.join(distDir, "index.css"), result.css);
    console.log("✅ CSS processed successfully");
  } catch (error) {
    console.error("❌ Error processing CSS:", error);
    process.exit(1);
  }

  // Build options for app
  const buildOptions: BuildConfig = {
    entrypoints: ["./src/App.tsx"],
    outdir: distDir,
    naming: "[name].[hash].js",
    minify: false, // Disable minification for easier debugging
    target: "browser",
    sourcemap: "inline", // Include source maps for debugging
    splitting: false, // Bundle everything into a single file
    // No external dependencies - include Monaco Editor in bundle
    external: [],
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
    
    // Get the generated filename
    const jsOutput = result.outputs.find(output => output.path.endsWith('.js'));
    if (!jsOutput) {
      throw new Error('No JavaScript output found');
    }
    
    const jsFilename = path.basename(jsOutput.path);
    console.log(`📝 Generated JavaScript file: ${jsFilename}`);
    
    // Update HTML with correct script path
    const updatedHtml = htmlContent.replace(
      '<script type="module" src="/App.js"></script>',
      `<script type="module" src="/${jsFilename}"></script>`
    );
    
    // Write the updated HTML
    await Bun.write(path.join(distDir, "index.html"), updatedHtml);
    console.log("📋 HTML updated with correct script reference");
    
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
