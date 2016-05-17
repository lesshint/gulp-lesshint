# gulp-lesshint
[![Build Status](https://travis-ci.org/lesshint/gulp-lesshint.svg?branch=master)](https://travis-ci.org/lesshint/gulp-lesshint)

## Installation
```bash
npm install gulp-lesshint --save-dev
```

## Usage
```js
var gulp = require('gulp');
var lesshint = require('gulp-lesshint');

gulp.task('lint', function() {
    return gulp.src('./src/*.less')
        .pipe(lesshint({
            // Options
        }))
        .pipe(lesshint.reporter('reporter-name')); // Leave empty to use the default, "stylish"
});
```

## Options
* `configPath`
    * Pass a path to a valid configuration file and stop lesshint from looking for a `.lesshintrc` file.

## Reporters
If no reporter name is passed, the default `lesshint-reporter-stylish` will be used which just prints everything with different colors.
If you wish to specify your own, please refer to the [lesshint reporter loading steps](https://github.com/lesshint/lesshint#the-reporter-loading-steps)
for the exact logic.

## Result
The following properties will be added to the `file` object.

```js
file.lesshint.success = true; // or false
file.lesshint.resultCount = 0; // number of results returned by lesshint
file.lesshint.results = []; // lesshint results
```
