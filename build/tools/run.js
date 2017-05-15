import { white, cyan, magenta } from 'chalk'
import { log } from './log'

/**
 * @param name
 * @param time
 * @returns {string}
 */
export function start(name, options) {
    name = options ? `${name} ${options.toString()}` : name
    log(`${white("Starting '")}${cyan(name)}${white("'...")}`)
}

/**
 * @param name
 * @param time
 * @param duration
 * @returns {string}
 */
export function end(name, startTime) {
    const duration = new Date().getTime() - startTime.getTime()
    log(`${white("Finished '")}${cyan(name)} ${white('after')} ${magenta(duration)} ms`)
}

/**
 * @param fn
 * @param options
 * @returns {Promise.<TResult>|*}
 */
function run(fn, options) {
    const task = typeof fn.default === 'undefined' ? fn : fn.default
    const startTime = new Date()
    start(task.name, options)
    return task(options).then(resolution => {
        end(task.name, startTime)
        return resolution;
    });
}

if (require.main === module && process.argv.length > 2) {
    delete require.cache[__filename] // eslint-disable-line no-underscore-dangle
    const module = require(`./${process.argv[2]}.js`)
    run(module).catch(err => { console.error(err.stack); process.exit(1) })
}

export default run
