'use strict';

var assert = require('assert');
var gutil = require('gulp-util');
var lesshint = require('../');

it('should check less files', function (cb) {
    var stream = lesshint();

    stream.on('error', function (error) {
        if (/spaceBeforeBrace/.test(error) && /spaceAfterPropertyColon/.test(error)) {
            assert(true);

            cb();
        }
    });

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/fixture.less',
        contents: new Buffer('.foo{ color: red; } \n')
    }));

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/fixture2.less',
        contents: new Buffer('.foo { color:red; } \n')
    }));

    stream.end();
});

it('should allow valid files', function (cb) {
    var stream = lesshint();

    stream.on('data', function () {});

    stream.on('error', function (error) {
        assert(false);
    });

    stream.on('end', cb);

    stream.write(new gutil.File({
        path: __dirname + '/fixture.less',
        contents: new Buffer('.foo { color: red; } \n')
    }));

    stream.end();
});

it('should load file specified in configPath', function (cb) {
    var stream = lesshint({
        configPath: './test/config.json'
    });

    stream.on('data', function () {});

    stream.on('error', function (error) {
        assert(false);

        cb();
    });

    stream.on('end', cb);

    stream.write(new gutil.File({
        base: __dirname,
        path: __dirname + '/fixture.less',
        contents: new Buffer('.foo{ color: red; } \n')
    }));

    stream.end();
});
