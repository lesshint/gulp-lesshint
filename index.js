'use strict';

const PluginError = require('plugin-error');
const Lesshint = require('lesshint').Lesshint;
const through = require('through2');

const lesshintPlugin = (options) => {
    const lesshint = new Lesshint();

    options = options || {};
    options = lesshint.getConfig(options.configPath);

    lesshint.configure(options);

    let error;

    return through.obj(function (file, enc, cb) {
        if (file.isStream()) {
            return cb(new PluginError('gulp-lesshint', 'Streaming not supported'));
        }

        if (file.isNull() || lesshint.isExcluded(file.path)) {
            return cb(null, file);
        }

        try {
            const contents = file.contents.toString();
            const results = lesshint.checkString(contents, file.path);

            file.lesshint = {
                resultCount: results.length,
                results,
                success: !results.length,
            };
        } catch (e) {
            error = e.stack.replace('null:', `${ file.path }:`);
        }

        this.push(file);

        return cb();
    }, function (cb) {
        if (error) {
            this.emit('error', new PluginError('gulp-lesshint', error, {
                showStack: false,
            }));
        }

        return cb();
    });
};

lesshintPlugin.reporter = (reporter) => {
    const lesshint = new Lesshint();

    reporter = reporter || 'lesshint-reporter-stylish';
    reporter = lesshint.getReporter(reporter);

    let results = [];

    return through.obj((file, enc, cb) => {
        if (file.lesshint && !file.lesshint.success) {
            results = results.concat(file.lesshint.results);
        }

        return cb(null, file);
    }, (cb) => {
        reporter.report(results);

        return cb();
    });
};

lesshintPlugin.failOnError = () => {
    let errorCount = 0;

    return through.obj((file, enc, cb) => {
        if (file.lesshint) {
            errorCount += file.lesshint.results.reduce((count, result) => {
                return count + (result.severity === 'error');
            }, 0);
        }

        return cb(null, file);
    }, function (cb) {
        if (!errorCount) {
            return cb();
        }

        const message = `Failed with ${ errorCount } ` + (errorCount === 1 ? 'error' : 'errors');

        this.emit('error', new PluginError('gulp-lesshint', message, {
            name: 'LesshintError'
        }));

        return cb();
    });
};

module.exports = lesshintPlugin;
