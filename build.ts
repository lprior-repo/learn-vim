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

  // Determine if this is a production build
  const isProduction = process.env.NODE_ENV === "production";
  console.log(`🏗️  Building for ${isProduction ? "production" : "development"}`);

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
    
    // Configure plugins based on environment
    const plugins = [tailwindcss, autoprefixer];
    
    // Add CSS nano for production minification instead of CSSO
    if (isProduction) {
      const cssnano = require("cssnano");
      plugins.push(cssnano({ preset: 'default' }));
    }
    
    const result = await postcss(plugins).process(css, {
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
    naming: isProduction ? "[name].[hash].js" : "[name].js",
    minify: isProduction, // Enable minification for production
    target: "browser",
    sourcemap: isProduction ? "external" : "inline", // External sourcemaps for production
    splitting: isProduction, // Enable code splitting for production
    // Make Monaco Editor external to reduce bundle size
    external: ["monaco-editor", "monaco-vim"],
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
