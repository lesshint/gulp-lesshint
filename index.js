'use strict';

const PluginError = require('plugin-error');
const Lesshint = require('lesshint').Lesshint;
const through = require('through2');

const { getSeverityCount, isError, isExcluded, isWarning, pluralize } = require('./utils');

const lesshintPlugin = (options = {}) => {
    const lesshint = new Lesshint();
    const config = lesshint.getConfig(options.configPath);

    lesshint.configure(config);

    let warningCount = 0;
    let maxWarnings;
    let error;

    if (options.maxWarnings) {
        maxWarnings = parseInt(options.maxWarnings) || 0;
    }

    return through.obj(function (file, enc, cb) {
        if (file.isStream()) {
            return cb(new PluginError('gulp-lesshint', 'Streaming not supported'));
        }

        if (file.isNull() || isExcluded(config, file.path)) {
            return cb(null, file);
        }

        try {
            const contents = file.contents.toString();
            const results = lesshint.checkString(contents, file.path);

            warningCount += getSeverityCount(results, isWarning);

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
        } else if (warningCount > maxWarnings) {
            const message = `Failed with ${ warningCount } ${ pluralize('warning', warningCount) }. Maximum allowed is ${ options.maxWarnings }.`;

            this.emit('error', new PluginError('gulp-lesshint', message, {
                name: 'LesshintError',
            }));
        }

        return cb();
    });
};

lesshintPlugin.reporter = (reporter = 'lesshint-reporter-stylish') => {
    const lesshint = new Lesshint();

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
            errorCount += getSeverityCount(file.lesshint.results, isError);
        }

        return cb(null, file);
    }, function (cb) {
        if (!errorCount) {
            return cb();
        }

        const message = `Failed with ${ errorCount } ${ pluralize('error', errorCount) }`;

        this.emit('error', new PluginError('gulp-lesshint', message, {
            name: 'LesshintError',
        }));

        return cb();
    });
};

module.exports = lesshintPlugin;
