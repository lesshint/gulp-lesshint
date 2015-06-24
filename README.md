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
});
```

## Options
* `configPath`
    * Pass a path to a valid configuration file and stop lesshint from looking for a `.lesshintrc` file.

## Result
The following properties will be added to the `file` object.

```js
file.lesshint.success = true; // or false
file.lesshint.errorCount = 0; // number of errors returned by lesshint
file.lesshint.errors = []; // lesshint errors
```
