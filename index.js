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
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new PluginError('gulp-lesshint', 'Streaming not supported'));
        }

        if (lesshint.isExcluded(file.path)) {
            return cb(null, file);
        }

        try {
            const contents = file.contents.toString();
            const results = lesshint.checkString(contents, file.path);

            file.lesshint = {
                resultCount: 0,
                results: [],
                success: true,
            };

            if (results.length) {
                file.lesshint.success = false;
                file.lesshint.resultCount = results.length;
                file.lesshint.results = results;
            }
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

    if (reporter) {
        reporter = lesshint.getReporter(reporter);
    } else {
        reporter = require('lesshint-reporter-stylish');
    }

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
            file.lesshint.results.forEach((result) => {
                if (result.severity === 'error') {
                    errorCount++;
                }
            });
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
