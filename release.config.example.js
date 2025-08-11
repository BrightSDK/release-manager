// Release Manager Configuration Example
// Copy this file to your project as 'release.config.js'

module.exports = {
    // Required: Pattern to find your build artifacts
    artifactsPattern: 'dist/**/*.{js,css,map}'

    // All other options have sensible defaults:
    // - outputDir: 'releases'
    // - versionDirectories: ['major', 'minor', 'patch', 'latest']
    // - preserveDirectory: false
    // - generateManifest: true
    // - packageJsonPath: './package.json'
};

// Common use cases:

// Simple JavaScript library:
// module.exports = {
//     artifactsPattern: 'dist/*.min.js'
// };

// React/Vue app with directory structure:
// module.exports = {
//     artifactsPattern: 'build/**/*.{js,css}',
//     preserveDirectory: true
// };

// Only specific versions:
// module.exports = {
//     artifactsPattern: 'dist/**/*.css',
//     versionDirectories: ['major', 'latest']
// };
