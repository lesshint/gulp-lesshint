'use strict';

const minimatch = require('minimatch');

module.exports = {
    isExcluded (config, checkPath) {
        const excludedFiles = config && config.excludedFiles || [];

        return excludedFiles.some((pattern) => {
            return minimatch(checkPath, pattern, {
                matchBase: true,
            });
        });
    },
};
