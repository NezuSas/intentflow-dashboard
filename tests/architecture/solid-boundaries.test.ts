import {
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";

import {
  join,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

function getTypeScriptFiles(
  directory: string
): string[] {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path =
        join(directory, entry);

      if (statSync(path).isDirectory()) {
        return getTypeScriptFiles(path);
      }

      if (
        path.endsWith(".ts") ||
        path.endsWith(".tsx")
      ) {
        return [path];
      }

      return [];
    });
}

describe(
  "SOLID dependency boundaries",
  () => {
    it(
      "features do not depend on composition",
      () => {
        const files =
          getTypeScriptFiles(
            join(
              process.cwd(),
              "src",
              "features"
            )
          );

        for (const file of files) {
          expect(
            readFileSync(
              file,
              "utf-8"
            ),
            file
          ).not.toContain(
            "@/composition"
          );
        }
      }
    );

    it(
      "core does not depend on features",
      () => {
        const files =
          getTypeScriptFiles(
            join(
              process.cwd(),
              "src",
              "core"
            )
          );

        for (const file of files) {
          expect(
            readFileSync(
              file,
              "utf-8"
            ),
            file
          ).not.toContain(
            "@/features/"
          );
        }
      }
    );

    it(
      "feature barrels do not compose dependencies",
      () => {
        const files =
          getTypeScriptFiles(
            join(
              process.cwd(),
              "src",
              "features"
            )
          ).filter(
            (file) =>
              file
                .replaceAll("\\", "/")
                .endsWith("/index.ts")
          );

        for (const file of files) {
          expect(
            readFileSync(
              file,
              "utf-8"
            ),
            file
          ).not.toMatch(
            /\bnew\s+\w+(?:Repository|Service)\s*\(/
          );
        }
      }
    );
  }
);
