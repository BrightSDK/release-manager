// Release Manager Configuration Example
// Copy this file to your project as 'release.config.js'

module.exports = {
    // Artifacts to process (glob pattern)
    // These should be pre-built files from your bundler
    artifactsPattern: 'dist/**/*.{js,css,map}',

    // Output directory for releases
    outputDir: 'releases',

    // Path to package.json (for version info)
    packageJsonPath: './package.json',

    // Create version-specific directories (v1, v1.2, v1.2.3)
    createVersionDirectories: true,

    // Create latest copies in the output root
    createLatestCopy: true,

    // Create versioned copies in the output root
    createVersionedCopy: true,

    // File naming templates
    fileNameTemplate: '{basename}-{version}{ext}',
    latestFileTemplate: '{basename}-latest{ext}',

    // Which version directories to create
    versionDirectories: ['major', 'minor', 'patch'],

    // Preserve directory structure from artifacts
    preserveDirectory: false,

    // Copy source maps along with JS/CSS files
    copySourceMaps: true,

    // Generate a manifest.json with file information
    generateManifest: true
};

// Example configurations for different project types:

// For webpack output:
// module.exports = {
//     artifactsPattern: 'dist/**/*.{js,css}',
//     outputDir: 'releases',
//     preserveDirectory: true,
//     fileNameTemplate: '{basename}-{version}{ext}',
//     versionDirectories: ['major', 'minor']
// };

// For rollup output:
// module.exports = {
//     artifactsPattern: 'build/*.{js,css,map}',
//     outputDir: 'cdn',
//     createVersionDirectories: true,
//     generateManifest: true
// };

// For simple JS library:
// module.exports = {
//     artifactsPattern: 'lib/my-library.min.js',
//     outputDir: 'releases',
//     fileNameTemplate: 'my-library-{version}.min.js',
//     latestFileTemplate: 'my-library-latest.min.js',
//     versionDirectories: ['major', 'minor']
// };

// For CSS framework:
// module.exports = {
//     artifactsPattern: 'dist/**/*.{css,css.map}',
//     outputDir: 'releases',
//     preserveDirectory: true,
//     fileNameTemplate: '{basename}-{version}{ext}',
//     createVersionDirectories: true
// };

// For development/staging (no versioning):
// module.exports = {
//     artifactsPattern: 'build/**/*',
//     outputDir: 'staging',
//     createVersionDirectories: false,
//     createVersionedCopy: false,
//     generateManifest: false
// };
