/* eslint-disable prefer-spread, no-console */

import chalk from 'chalk'
import timestamp from 'time-stamp'

function getTimestamp() {
    return `[${chalk.grey(timestamp('HH:mm:ss'))}]`
}

export function log(...rest) {
    const time = getTimestamp()
    process.stdout.write(time + ' ')
    console.log.apply(console, rest)
    return this
}

export function error(...rest) {
    const time = getTimestamp()
    process.stdout.write(time + ' ')
    console.error.apply(console, rest)
    return this
}