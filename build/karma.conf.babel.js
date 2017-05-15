import webpackConfig from './webpack.config.babel.js'
import config from './config/test'
import {argv} from 'yargs'

const {__TESTCI__} = config.compiler_globals

module.exports = (karmaConfig) => {
    karmaConfig.set({
        colors: true,
        logLevel: karmaConfig.LOG_INFO,
        basePath: process.cwd(),
        browsers: ['PhantomJS', 'Chrome'],
        singleRun: false,
        reporters: __TESTCI__ ? ['bamboo', 'coverage'] : ['mocha', 'coverage', 'bamboo'],
        files: [
            // `${config.paths.testDir}/setup.js`,
            `${config.paths.testDir}/tests.bundle.js`,
            // `${config.paths.testDir}/**/*-test.js`
        ],
        // plugins: ['karma-bamboo-reporter'],
        frameworks: [
            'phantomjs-shim',
            'mocha',
        ],
        phantomjsLauncher: {
            // exit on ResourceError, useful if karma exits without killing phantom
            exitOnResourceError: true,
        },
        coverageReporter: {
            reporters: config.coverage_reporters,
            includeAllSources: true,
        },
        bambooReporter: {
            filename: 'build/reports/mocha.json'
        },
        preprocessors: {
            // do not include 'coverage' preprocessor for karma-coverage
            // code is already instrumented by babel-plugin-__coverage__
            './test/tests.bundle.js': ['webpack'],
            // './test/setup.js': ['babel'],
            // './test/**/*-test.js': ['babel']
        },
        client: {
            mocha: {
                reporter: 'html',
                ui: 'bdd',
            },
        },
        webpack: {
            devtool: config.compiler_devtool,
            module: {
                ...webpackConfig.module,
                loaders: [
                    {
                        test: /sinon\.js$/,
                        loader: 'imports?define=>false,require=>false',
                    },
                    ...webpackConfig.module.loaders,
                ],
            },
            plugins: [
                ...webpackConfig.plugins,
            ],
            resolve: {
                ...webpackConfig.resolve,
                alias: {
                    ...webpackConfig.resolve.alias,
                    sinon: 'sinon/pkg/sinon',
                },
            },
            externals: {
                ...webpackConfig.externals,
                jsdom: 'window',
                cheerio: 'window',
                'react/lib/ExecutionEnvironment': true,
                'react/lib/ReactContext': 'window',
                'react/addons': true,
            }
        },

        webpackServer: {
            progress: false,
            stats: config.compiler_stats,
            debug: true,
            noInfo: true,
            quiet: true,
        },
    })
};
