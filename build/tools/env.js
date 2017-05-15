/**
 * Sets arbitrary environmental variables based on npm run flags
 */
async function env() {
    return new Promise((resolve, reject) => {
        const { argv } = process
        switch (true) {
            case argv.includes('--p') :
                process.env.NODE_ENV = 'production'
                break
            case argv.includes('--d') :
                process.env.NODE_ENV = 'development'
                break
            case argv.includes('--t') :
                process.env.NODE_ENV = 'test'
                break
            default :
                process.env.NODE_ENV = 'development'
                break
        }
        return resolve()
    })
}

export default env