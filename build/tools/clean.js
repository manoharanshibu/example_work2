import fs from './lib/fs'

/**
 * Cleans up the output (dist) directory.
 */
async function clean() {
    await fs.empty('.tmp')
    await fs.empty('dist')
}

export default clean;
