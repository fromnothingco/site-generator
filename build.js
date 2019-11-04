const ejs = require("ejs")
const fs = require('fs');
const util = require('util');
const config = require('./routes.json')

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);
const access = util.promisify(fs.access);

const getContextFiles = async (ourdir) => {
  try {
    return await readdir(ourdir)
  } catch (e) {
    return []
  }
}

const createDir = async (ourdir) => {
  try {
    return await mkdir(ourdir, { recursive: true })
  } catch (e) {
    return false
  }
}

const getLocalDataFile = async (ourdir) => {
  try {
    return await readdir(ourdir)
  } catch (e) {
    return false
  }
}

const writeIndexPages = async (writepath, data) => {
  try {
    return await writeFile(writepath, data)
  } catch (e) {
    return false
  }
}

const getFiles = async () => {
  try {
    const { contexts, globalData, partials } = config
    const gdata = JSON.parse(await readFile(__dirname + globalData))
    Object.keys(contexts)
      .map(async dir => {
        const outDir = `${__dirname}/dist${contexts[dir].baseRoute}`
        //read directory of contexts (pages routes)
        const files = await getContextFiles(`${__dirname}/src/contexts/${dir}`)
        //basedir for the contexts
        await createDir(`${outDir}`)
        //create dir if it doesnt exist
        // map over files in context dir
        files.map(async item => {
          // get local data file
          const localData = await getLocalDataFile(`${__dirname}/src/contexts/${dir}/${item}/data.json`)
          // get html files and render with ejs
          const html = await ejs.renderFile(`${__dirname}/src/contexts/${dir}/${item}/index.html`, Object.assign(
            {},
            localData,
            gdata,
            // shold change this to an reduce to keep more modular 
            {
              header: __dirname + partials.header,
              footer: __dirname + partials.footer
            }
          ))
          // if its an index file create file at the base of the dir
          if (item === "index") {
            return await writeIndexPages(`${outDir}/index.html`, html)
          }
          // other wise create index file inside of directory
          await createDir(`${outDir + '/' + item}`)
          await writeIndexPages(`${outDir + '/' + item}/index.html`, html)
        })
      })
  } catch (e) {
    throw new Error(e)
  }
}

getFiles()

