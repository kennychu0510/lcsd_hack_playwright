const {readFileSync, promises: fsPromises, writeFileSync} = require('fs');
function syncReadFile(filename) {
  const contents = readFileSync(filename, 'utf-8');

  const arr = contents.split(/\r?\n/);

  // console.log(arr); // 👉️ ['One', 'Two', 'Three', 'Four']

  writeFileSync('userAgents.json', JSON.stringify(arr))
  return arr;

}

syncReadFile('./raw/userAgents.txt');