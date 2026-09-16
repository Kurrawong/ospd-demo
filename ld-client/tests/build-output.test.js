import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";


const projectDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputDir = path.join(projectDir, "dist");

async function readOutput(relativePath) {
  return readFile(path.join(outputDir, relativePath.replace(/^\//, "")), "utf8");
}

test("built HTML references deployable local assets", async () => {
  const html = await readOutput("index.html");
  const references = [
    ...html.matchAll(/(?:src|href)=["']([^"']+)["']/g),
  ]
    .map((match) => match[1])
    .filter((reference) => !reference.startsWith("http"));

  assert.ok(references.length > 0, "expected local assets in the built HTML");

  for (const reference of references) {
    await assert.doesNotReject(
      readOutput(reference),
      `missing built asset: ${reference}`,
    );
  }
});

test("build embeds the configured SPARQL endpoint", async () => {
  const endpoint = process.env.VITE_SPARQL_ENDPOINT;
  assert.ok(endpoint, "VITE_SPARQL_ENDPOINT must be set while validating the build");

  const html = await readOutput("index.html");
  const scriptReferences = [...html.matchAll(/src=["']([^"']+\.js)["']/g)].map(
    (match) => match[1],
  );
  assert.ok(scriptReferences.length > 0, "expected a JavaScript bundle");

  const scripts = await Promise.all(scriptReferences.map(readOutput));
  assert.ok(
    scripts.some((script) => script.includes(endpoint)),
    "configured SPARQL endpoint was not embedded in the JavaScript bundle",
  );
});
