import fs from 'fs-extra'

const writeFile = (file, contents) => new Promise((resolve, reject) => {
  fs.outputFile(file, contents, 'utf8', err => err ? reject(err) : resolve())
});

const makeDir = (name) => new Promise((resolve, reject) => {
  fs.mkdirs(name, err => err ? reject(err) : resolve())
});

const remove = (dir) => new Promise((resolve, reject) => {
  fs.remove(dir, err => err ? reject(err) : resolve())
})

const empty = (dir) => new Promise((resolve, reject) => {
  fs.emptyDir(dir, err => err ? reject(err) : resolve())
})

export default { writeFile, makeDir, remove, empty }
