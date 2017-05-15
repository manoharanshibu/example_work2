function ErrorPlugin(options) {}

ErrorPlugin.prototype.apply = function(compiler) {

	compiler.plugin('done', function(stats) {
		if (stats.compilation.errors && stats.compilation.errors.length) {
			process.on('beforeExit', function() {
				process.exit(1);
			});
		}
	});
};

module.exports = ErrorPlugin;
