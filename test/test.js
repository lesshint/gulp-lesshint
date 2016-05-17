'use strict';

var PluginError = require('plugin-error');
var lesshint = require('../');
var assert = require('assert');
var Stream = require('stream');
var sinon = require('sinon');
var File = require('vinyl');

describe('gulp-lesshint', function () {
    beforeEach(function () {
        sinon.stub(process.stdout, 'write');
    });

    afterEach(function () {
        if (process.stdout.write.restore) {
            process.stdout.write.restore();
        }
    });

    it('should check less files', function (cb) {
        var stream = lesshint();

        stream.on('data', function (file) {
            assert.strictEqual(file.lesshint.success, false);
        });

        stream.on('end', cb);

        stream.write(new File({
            base: __dirname,
            path: __dirname + '/fixture.less',
            contents: new Buffer('.foo{\ncolor: red;\n}\n')
        }));

        stream.write(new File({
            base: __dirname,
            path: __dirname + '/fixture2.less',
            contents: new Buffer('.foo {\ncolor:red;\n}\n')
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

        stream.write(new File({
            path: __dirname + '/fixture.less',
            contents: new Buffer('.foo {\ncolor: red;\n}\n')
        }));

        stream.end();
    });

    it('should log results when using the default reporter', function (cb) {
        var lintStream = lesshint();
        var reporterStream = lesshint.reporter();

        sinon.spy(console, 'log');

        lintStream.on('data', function (file) {
            reporterStream.write(file);
        });

        lintStream.once('end', function () {
            reporterStream.end();
        });

        reporterStream.on('data', function () {});

        reporterStream.once('end', function () {
            assert.ok(console.log.called);

            cb();
        });

        lintStream.write(new File({
            base: __dirname,
            path: __dirname + '/fixture.less',
            contents: new Buffer('.foo{\ncolor: red;\n}\n')
        }));

        lintStream.end();
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

        stream.write(new File({
            base: __dirname,
            path: __dirname + '/fixture.less',
            contents: new Buffer('.foo {\ncolor: red;\n}\n')
        }));

        stream.end();
    });

    it('should ignore null files', function () {
        var stream = lesshint();

        stream.write(new File({
            base: __dirname,
            path: __dirname + '/fixture.less',
            contents: null
        }));

        stream.end();
    });

    it('should ignore streams', function () {
        var stream = lesshint();

        assert.throws(function () {
            stream.write(new File({
                base: __dirname,
                path: __dirname + '/fixture.less',
                contents: new Stream()
            }));
        }, PluginError);

        stream.end();
    });

    it('should ignore excluded files', function () {
        var stream = lesshint({
            configPath: './test/config.json'
        });

        stream.write(new File({
            base: __dirname,
            path: __dirname + '/exclude.less',
            contents: new Buffer('.foo{\ncolor: red;\n}\n')
        }));

        stream.end();
    });
});
