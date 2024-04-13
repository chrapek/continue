import * as glob from "glob";
import Mocha from "mocha";
import * as path from "path";

export function run() {
  // Avoid timing out when stopping on breakpoints during debugging in VSCode
  const timeoutOption = process.env.MOCHA_TIMEOUT
    ? parseInt(process.env.MOCHA_TIMEOUT)
    : // : undefined;
      15_000;

  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    timeout: timeoutOption,
  });

  // See esbuild.test.mjs for more details
  // Assumes this file is in out/test/runner/mochaRunner.js
  const compiledTestSuitesDirectory = path.resolve(__dirname, "../test-suites");

  glob
    .sync("**/**.test.js", { cwd: compiledTestSuitesDirectory })
    .forEach((file) => {
      mocha.addFile(path.resolve(compiledTestSuitesDirectory, file));
    });

  return new Promise<void>((resolve, reject) => {
    try {
      // Run the mocha test
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
