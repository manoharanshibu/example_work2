import fs from 'fs-extra';
import config from '../config'

async function cp(src, dest) {
    return new Promise((resolve, reject) => {
        fs.copy(src, dest, (err) => err ? reject(err) : resolve())
    })
}

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (dist) folder.
 */
async function copy({ watch } = {}) {
	const faviconName = config.baseName.indexOf('baba') > -1 ? 'baba_favicon' : 'favicon';
    await Promise.all([
        cp(`${config.paths.config}/config.js`, `${config.paths.distDir}/js/config.js`),
        cp(`${config.paths.srcDir}/${faviconName}.ico`, `${config.paths.distDir}/favicon.ico`),
        cp(`${config.paths.srcDir}/robots.txt`, `${config.paths.distDir}/robots.txt`)
    ]);
}

export default copy
