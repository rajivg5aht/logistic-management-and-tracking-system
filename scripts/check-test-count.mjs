import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const maximumTests = 250;
const declaration = /^\s*(?:test|it)\s*\(/gm;

const suites = [
  {
    label: "Backend Jest",
    directory: fileURLToPath(new URL("backend/src/__tests__/", root)),
    suffix: ".test.ts",
    expected: 190,
  },
  {
    label: "Frontend component",
    directory: fileURLToPath(new URL("frontend/tests/components/", root)),
    suffix: ".test.tsx",
    expected: 40,
  },
  {
    label: "Frontend end-to-end",
    directory: fileURLToPath(new URL("frontend/tests/e2e/", root)),
    suffix: ".spec.ts",
    expected: 18,
  },
];

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return filesBelow(path);
    }
    return [path];
  });
}

function countTests(suite) {
  return filesBelow(suite.directory)
    .filter((file) => file.endsWith(suite.suffix) && extname(file))
    .reduce((count, file) => {
      const matches = readFileSync(file, "utf8").match(declaration);
      return count + (matches?.length ?? 0);
    }, 0);
}

const results = suites.map((suite) => ({ ...suite, count: countTests(suite) }));
const total = results.reduce((sum, result) => sum + result.count, 0);

for (const result of results) {
  console.log(`${result.label}: ${result.count}`);
}
console.log(`Total: ${total}/${maximumTests}`);

const changedSuite = results.find((result) => result.count !== result.expected);
if (changedSuite) {
  console.error(
    `${changedSuite.label} changed from the approved ${changedSuite.expected}-test plan.`,
  );
  process.exitCode = 1;
} else if (total > maximumTests) {
  console.error(`Test count exceeds the ${maximumTests}-test assignment limit.`);
  process.exitCode = 1;
}
