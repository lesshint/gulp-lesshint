'use strict';

const PluginError = require('plugin-error');
const lesshint = require('../');
const assert = require('assert');
const Stream = require('stream');
const sinon = require('sinon');
const File = require('vinyl');

describe('gulp-lesshint', () => {
    beforeEach(() => {
        sinon.stub(process.stdout, 'write');
    });

    afterEach(() => {
        if (process.stdout.write.restore) {
            process.stdout.write.restore();
        }
    });

    it('should check less files', (cb) => {
        const stream = lesshint();

        stream.on('data', (file) => {
            assert.strictEqual(file.lesshint.success, false);
        });

        stream.on('end', cb);

        stream.write(new File({
            base: __dirname,
            path: __dirname + '/fixture.less',
            contents: new Buffer(`
                .foo{
                    color: red;
                }
            `)
        }));

        stream.write(new File({
            base: __dirname,
            path: __dirname + '/fixture2.less',
            contents: new Buffer(`
                .foo {
                    color:red;
                }
            `)
        }));

        stream.end();
    });

    it('should allow valid files', (cb) => {
        const stream = lesshint();

        stream.on('data', () => {});

        stream.on('error', () => {
            assert(false);
        });

        stream.on('end', cb);

        stream.write(new File({
            path: __dirname + '/fixture.less',
            contents: new Buffer(`
                .foo {
                    color: red;
                }
            `)
        }));

        stream.end();
    });

    it('should log results when using the default reporter', (cb) => {
        const lintStream = lesshint();
        const reporterStream = lesshint.reporter();

        sinon.spy(console, 'log');

        lintStream.on('data', (file) => {
            reporterStream.write(file);
        });

        lintStream.once('end', () => {
            reporterStream.end();
        });

        reporterStream.on('data', () => {});

        reporterStream.once('end', () => {
            /* eslint-disable no-console */
            assert.ok(console.log.called);

            console.log.restore();

            cb();
            /* eslint-enable no-console */
        });

        lintStream.write(new File({
            base: __dirname,
            path: __dirname + '/fixture.less',
            contents: new Buffer(`
                .foo{
                    color: red;
                }
            `)
        }));

        lintStream.end();
    });

    it('should load file specified in configPath', (cb) => {
        const stream = lesshint({
            configPath: './test/config.json'
        });

        stream.on('data', () => {});

        stream.on('error', () => {
            assert(false);

            cb();
        });

        stream.on('end', cb);

        stream.write(new File({
            base: __dirname,
            path: __dirname + '/fixture.less',
            contents: new Buffer(`
                .foo {
                    color: red;
                }
            `)
        }));

        stream.end();
    });

    it('should emit errors when asked to', (cb) => {
        const lintStream = lesshint({
            configPath: './test/config.json'
        });
        const failStream = lesshint.failOnError();

        lintStream.on('data', (file) => {
            failStream.write(file);
        });

        lintStream.once('end', () => {
            failStream.end();
        });

        failStream.on('data', () => {});

        failStream.on('error', (error) => {
            assert.equal(error.name, 'LesshintError');

            cb();
        });

        lintStream.write(new File({
            base: __dirname,
            path: __dirname + '/fixture.less',
            contents: new Buffer(`
                .foo {
                    color:red;
                }
            `)
        }));

        lintStream.end();
    });

    it('should ignore null files', () => {
        const stream = lesshint();

        stream.write(new File({
            base: __dirname,
            path: __dirname + '/fixture.less',
            contents: null
        }));

        stream.end();
    });

    it('should ignore streams', () => {
        const stream = lesshint();

        assert.throws(() => {
            stream.write(new File({
                base: __dirname,
                path: __dirname + '/fixture.less',
                contents: new Stream()
            }));
        }, PluginError);

        stream.end();
    });

    it('should ignore excluded files', () => {
        const stream = lesshint({
            configPath: './test/config.json'
        });

        stream.write(new File({
            base: __dirname,
            path: __dirname + '/exclude.less',
            contents: new Buffer(`
                .foo{
                    color: red;
                }
            `)
        }));

        stream.end();
    });
});
