'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var Lesshint = require('lesshint');
var configLoader = require('lesshint/lib/config-loader');

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
            cb(null, file);

            return;
        }

        if (file.isStream()) {
            cb(new gutil.PluginError('gulp-lesshint', 'Streaming not supported'));

            return;
        }

        if (lesshint.isExcluded(file.path)) {
            cb(null, file);

            return;
        }

        try {
            contents = file.contents.toString();
            results = lesshint.checkString(contents, file.relative);

            file.lesshint = {
                success: true,
                resultCount: 0,
                results: []
            };

            if (results.length) {
                file.lesshint.success = false;
                file.lesshint.resultCount = results.length;
                file.lesshint.results = results;
            }
        } catch (e) {
            error = e.stack.replace('null:', file.relative + ':');
        }

        cb(null, file);
    }, function (cb) {
        if (error) {
            this.emit('error', new gutil.PluginError('gulp-lesshint', error, {
                showStack: false
            }));
        }

        cb();
    });
};

lesshintPlugin.reporter = function () {
    return through.obj(function (file, enc, cb) {
        var out = [];

        if (file.lesshint && !file.lesshint.success) {
            file.lesshint.results.forEach(function (result) {
                var output = '';

                output += gutil.colors.cyan(result.file) + ': ';

                if (result.line) {
                    output += gutil.colors.magenta('line ' + result.line) + ', ';
                }

                if (result.column) {
                    output += gutil.colors.magenta('col ' + result.column) + ', ';
                }

                output += gutil.colors.green(result.linter) + ': ';
                output += result.message;

                out.push(output);
            });

            if (out.length) {
                gutil.log(out.join('\n'));
            }
        }

        return cb(null, file);
    });
};

module.exports = lesshintPlugin;
