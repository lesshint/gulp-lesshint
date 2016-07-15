# Changelog
## 2.0.0 (2016-07-15)
* **This release contains possible breaking changes. Check this list before updating.**
* Updated `lesshint` to `2.0.0`.
* Reporters are now called at the end of the stream with complete lint results.
* The `fullPath` property in lint result objects passed to reporters are now the full path and not a relative one.

## 2.0.0-rc (2016-05-17)
* **This release contains possible breaking changes. Check this list before updating.**
* Updated `lesshint` to `2.0.0-rc`.
* Files are now pushed downwards in the stream.
* Replaced the default reporter with `lesshint-reporter-stylish` which looks the same.
* It's now possible to load any reporter in the `lesshint.reporter()` call.
* Replaced `gulp-util` with smaller dependencies.
* Replaced `JSHint` and `JSCS` with `ESLint`.
* Dropped support for Node `0.10`.

## 1.1.0 (2016-02-21)
* The default reporter now also outputs the result severity.

## 1.0.0 (2015-10-19)
* Updated to `lesshint` `1.0`.
* Lint errors are no longer emitted to the stream.
* The `errors` property on each file in the stream is now called `results`.
* Moved logging to its own reporter.

## 0.4.0 (2015-08-31)
* Updated `lesshint` to `0.9.0`.

## 0.3.0 (2015-08-16)
* Updated `lesshint` to `0.8.0`.
* Updated other dependencies.
* More tests.

## 0.2.0 (2015-06-26)
* Updated `lesshint` to stable `0.7.0`.

## 0.1.1 (2015-06-24)
* `gulp-lesshint` has a new home: https://github.com/lesshint/gulp-lesshint

## 0.1.0 (2015-06-11)
* Initial release
