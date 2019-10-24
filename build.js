const ejs = require("ejs")
const fs = require('fs');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);
const access = util.promisify(fs.access);

const getDataFile = async (dir) => {
  const file = `${__dirname}/src/pages/${dir}/data.json`
  try {
    await access(file)
  } catch (e) {
    return false
  }

  return await readFile(file, 'utf8')
}

const getFiles = async () => {
  try {
    const files = await readdir(`${__dirname}/src/pages`)
    files.forEach(async item => {
      const outDir = `${__dirname}/dist/${item}`
      try {
        const file = await readFile(`${__dirname}/src/pages/${item}/index.html`, 'utf8')
        const data = await getDataFile(item)
        const output = ejs.render(file, Object.assign(JSON.parse(data), {
          header: __dirname + '/src/partials/header.ejs',
          footer: __dirname + '/src/partials/footer.ejs'
        }))

        if (item === "index") {
          return await writeFile(`${__dirname}/dist/index.html`, output)
        }

        try {
          await stat(outDir)
          return await writeFile(`${outDir}/index.html`, output)
        } catch (e) {
          await mkdir(outDir, { recursive: true })
          return await writeFile(`${outDir}/index.html`, output)
        }
      } catch (e) {
        console.log("error", e)
      }
    })
  } catch (e) {
    throw new Error(e)
  }
}

getFiles()

