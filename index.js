'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var chalk = require('chalk');
var Lesshint = require('lesshint');
var configLoader = require('lesshint/lib/config-loader');

module.exports = function (options) {
    var lesshint = new Lesshint();
    var out = [];

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

            results.forEach(function (result) {
                var output = '';

                output += chalk.cyan(result.file) + ': ';

                if (result.line) {
                    output += chalk.magenta('line ' + result.line) + ', ';
                }

                if (result.column) {
                    output += chalk.magenta('col ' + result.column) + ', ';
                }

                output += chalk.green(result.linter) + ': ';
                output += result.message;

                out.push(output);
            });
        } catch (e) {
            out.push(e.stack.replace('null:', file.relative + ':'));
        }

        cb(null, file);
    }, function (cb) {
        if (out.length) {
            this.emit('error', new gutil.PluginError('gulp-lesshint', out.join('\n'), {
                showStack: false
            }));
        }

        cb();
    });
};
