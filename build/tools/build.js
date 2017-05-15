import env from './env'
import run from './run'
import clean from './clean'
import copy from './copy'
import bundle from './bundle'
import { end } from './run'

/**
 * Compiles the project from source files into a distributable
 * format and copies it to the output (build) folder.
 */
async function build() {
    const time = new Date()

    await run(env)
    await run(clean)
    await run(copy)
    await run(bundle, '--dll')
    await run(bundle, '--app')

    end('Build completed', time)
}

export default build
