## Build Automation Tools

##### `npm start` (`start.js`)

* Cleans up the output `/dist` directory (`clean.js`)
* Copies static files to the output folder (`copy.js`)
* Launches [Webpack](https://webpack.github.io/) compiler in a watch mode (via [webpack-middleware](https://github.com/kriasoft/webpack-middleware))

##### `npm run build` (`build.js`)

* Cleans up the output `/build` folder (`clean.js`)
* Copies static files to the output folder (`copy.js`)
* Creates application bundles with Webpack (`bundle.js`, `webpack.config.js`)

Flag        | Description
----------- | -------------------------------------------------- 
`--p`       | Minimizes and optimizes the compiled output
`--verbose` | Prints detailed information to the console
`--static`  | Renders [specified routes](./render.js#L15) as static html files