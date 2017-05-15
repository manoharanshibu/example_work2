import gulp from 'gulp'
import requireDir from 'require-dir'
import runSequence from 'run-sequence'

// require all tasks
requireDir('build/gulp', { recurse: true });

/**
 * Main gulp entry point
 */
gulp.task('default', (cb) => {
	runSequence('serve', 'watch', cb);
})
