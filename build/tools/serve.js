/* eslint-disable camelcase */

import path from 'path'
import express from 'express'
import https from 'https'
import fs from 'fs'

import webpack from 'webpack'
import webpackMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackConfig from '../webpack.config.babel'
import history from 'connect-history-api-fallback'
import config from '../config'
import { log, error } from '../tools/log'
import { yellow } from 'chalk'

const { __DEV__ } = config.compiler_globals
const { server_host, server_port } = config
const url = `https://${server_host}:${server_port}`

// This line is from the Node.js HTTPS documentation.
const options = {
    key: fs.readFileSync(`${config.paths.buildDir}/tools/certs/test_key.pem`),
    cert: fs.readFileSync(`${config.paths.buildDir}/tools/certs/test_cert.pem`)
};

/**
 * Development using webpack-dev-middleware
 * @param app
 */
function addDevMiddleware(app) {
    const compiler = webpack(webpackConfig)

    // Start a webpack-dev-server
    const devMiddleware =  webpackMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: config.compiler_stats,
        noInfo: false,
        silent: false
    })


    // Enables HMR
    app.use(this.middleware = devMiddleware)
    app.use(webpackHotMiddleware(compiler))
    app.use(express.static(config.paths.srcDir))

    addResources(app)
    historyFallback(app, this.middleware)
    startExpress(app)
}
/**
 * Production using express to serve app
 * @param app
 */
function addProdMiddleware(app) {
    // Serve all static files from the dist directory
    app.use(express.static(config.paths.distDir))

    addResources(app)
    historyFallback(app)
    startExpress(app)
}

/**
 * Adds static resources to the express routes
 * @param app
 */
function addResources(app) {
    // Serve the dll from the file system
    app.get(/dll.vendor.js$/, (req, res) => {
        res.sendFile(`${config.paths.distDir}/js/dll.vendor.js`)
    })

    // Serve the config from the file system
    app.get(/^\/js\/config.js$/, (req, res) => {
        res.sendFile(`${config.paths.distDir}/js/config.js`)
    })
}

/**
 * Redirects no resolved routes (internal react-router routes)
 * back to index.html providing pushState mechanism
 * @param app
 * @param middleware
 */
function historyFallback(app, middleware) {
    app.get('*', (req, res) => {
        // PushState hack
        // @see https://gist.github.com/maman/8e91e6cb4ca9feaa4290
        if (__DEV__) {
            const index = path.join(config.paths.distDir, 'index.html')
            res.end(middleware.fileSystem.readFileSync(index));
            return;
        }
        // otherwise send actual index.html
        res.sendFile(`${config.paths.distDir}/index.html`);
    });
}


/**
 * Start express
 * @param app
 */
function startExpress(app) {

   // app.use(history({ verbose: true, logger: () => {} }))
    const server = https.createServer(options, app)
    server.listen(server_port, server_host, (err) => {
        if (err) {
            error(err)
        }
        log(yellow(`Open ${url} in your browser.`))
    })
}

async function serve() {
    const app = express()
    const middleware = __DEV__ ?
        addDevMiddleware : addProdMiddleware
    middleware.apply(middleware, [app])
}

export default serve
