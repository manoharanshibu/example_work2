import webpack from 'webpack'
import config from '../config'

/**
 * Creates application bundles from the source files.
 */
function bundle(options) {
    const argv = options || process.argv
    const dll  = argv.includes('--dll')
    const path = `../webpack.${dll ? 'dll' : 'config'}.babel`

    return new Promise((resolve, reject) => {
        webpack(require(path)).run((err, stats) => {
            if (err) {
                return reject(err)
            }

            console.log(stats.toString(config.compiler_stats))
            return resolve()
        })
    })
}

export default bundle