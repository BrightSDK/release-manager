// Release Manager Configuration Example
// Copy this file to your project as 'release.config.js'

module.exports = {
    // Artifacts to process (glob pattern for pre-built files)
    artifactsPattern: 'dist/**/*.{js,css,map}',

    // Output directory for releases
    outputDir: 'releases',

    // Which version directories to create (each gets own directory + manifest)
    // Available: 'major', 'minor', 'patch', 'latest'
    versionDirectories: ['major', 'minor', 'patch', 'latest'], // Default: Creates all 4 directories

    // Preserve source directory structure in each version directory
    preserveDirectory: true
};

// Most common configurations:

// JavaScript Library (simple):
// module.exports = {
//     artifactsPattern: 'dist/*.min.js'
// };

// React/Vue App:
// module.exports = {
//     artifactsPattern: 'build/**/*.{js,css}',
//     preserveDirectory: true
// };

// CSS Framework:
// module.exports = {
//     artifactsPattern: 'dist/**/*.css',
//     versionDirectories: ['major', 'latest'] // Major version + latest: v1/, latest/
// };

// Full versioning with latest:
// module.exports = {
//     artifactsPattern: 'dist/**/*',
//     versionDirectories: ['major', 'minor', 'patch', 'latest'] // v1/, v1.2/, v1.2.3/, latest/
// };
