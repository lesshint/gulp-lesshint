'use strict';

const minimatch = require('minimatch');

module.exports = {
    getSeverityCount (results, isSeverityFn) {
        return results.reduce((sum, result) => {
            return sum + (isSeverityFn(result.severity) ? 1 : 0);
        }, 0);
    },

    isError (severity) {
        return severity === 'error';
    },

    isExcluded (config, checkPath) {
        const excludedFiles = config && config.excludedFiles || [];

        return excludedFiles.some((pattern) => {
            return minimatch(checkPath, pattern, {
                matchBase: true,
            });
        });
    },

    isWarning (severity) {
        return severity === 'warning';
    },

    pluralize (singular, count) {
        return count === 1 ? singular : `${ singular }s`;
    },
};
