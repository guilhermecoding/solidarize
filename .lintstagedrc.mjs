import path from "node:path";

const eslintFix = (filenames) =>
  `eslint --fix ${filenames
    .map((file) => `"${path.relative(process.cwd(), file)}"`)
    .join(" ")}`;

const lintStagedConfig = {
  "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}": eslintFix,
};

export default lintStagedConfig;
