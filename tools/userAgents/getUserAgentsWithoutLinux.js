const { readFileSync, promises: fsPromises, writeFileSync } = require("fs");
function syncReadFile(filename) {
  const contents = readFileSync(filename, "utf-8");

  const arr = contents.split(/\r?\n/).filter((item) => !item.includes("Linux"));

  writeFileSync(
    "./tools/userAgents/output/userAgentsWithoutLinux.json",
    JSON.stringify(arr)
  );
  return arr;
}

syncReadFile("./tools/userAgents/userAgents.txt");
