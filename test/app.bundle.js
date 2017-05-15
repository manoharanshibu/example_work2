const scriptsContext = require.context('../src/scripts', true, /\.js(|x)$/)
scriptsContext.keys().forEach(scriptsContext)