'use strict';

var configLoader = require('lesshint/lib/config-loader');
var PluginError = require('plugin-error');
var Lesshint = require('lesshint');
var through = require('through2');

var lesshintPlugin = function (options) {
    var lesshint = new Lesshint();
    var error;

    options = options || {};

    if (options.configPath) {
        options = configLoader(options.configPath);
    } else {
        // Let lesshint find the options itself (from a .lesshintrc file)
        options = configLoader();
    }

    lesshint.configure(options);

    return through.obj(function (file, enc, cb) {
        var contents;
        var results;

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
            contents = file.contents.toString();
            results = lesshint.checkString(contents, file.path);

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
            error = e.stack.replace('null:', file.path + ':');
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

lesshintPlugin.reporter = function (reporter) {
    var lesshint = new Lesshint();
    var results = [];

    if (reporter) {
        reporter = lesshint.getReporter(reporter);
    } else {
        reporter = require('lesshint-reporter-stylish');
    }

    return through.obj(function (file, enc, cb) {
        if (file.lesshint && !file.lesshint.success) {
            results = results.concat(file.lesshint.results);
        }

        return cb(null, file);
    }, function (cb) {
        reporter.report(results);

        return cb();
    });
};

module.exports = lesshintPlugin;
