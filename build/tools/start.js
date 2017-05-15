import config from '../config'
import build from './build'
import bundle from './bundle'
import serve from './serve'
import run from './run'

const { __DEV__ } = config.compiler_globals

async function start() {
    if (__DEV__) {
        await  run(bundle, '--dll')
        return run(serve)
    }
    await run(build)
    await run(serve)
}

export default start
