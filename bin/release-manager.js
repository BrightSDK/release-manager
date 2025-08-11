#!/usr/bin/env node

// LICENSE_CODE ZON

const yargs = require('yargs');
const ReleaseManager = require('../src/index.js');

async function main() {
    const argv = yargs
        .scriptName('release-manager')
        .usage('$0 [options]')
        .option('config', {
            alias: 'c',
            type: 'string',
            description: 'Path to configuration file',
            default: './release.config.js'
        })
        .option('artifacts', {
            alias: 'a',
            type: 'string',
            description: 'Artifacts pattern to process',
            default: 'dist/**/*.{js,css,map}'
        })
        .option('output', {
            alias: 'o',
            type: 'string',
            description: 'Output directory',
            default: 'releases'
        })
        .option('no-version-dirs', {
            type: 'boolean',
            description: 'Skip creating version directories',
            default: false
        })
        .option('no-latest', {
            type: 'boolean',
            description: 'Skip creating latest files',
            default: false
        })
        .option('preserve-dirs', {
            type: 'boolean',
            description: 'Preserve directory structure from artifacts',
            default: false
        })
        .option('package', {
            alias: 'p',
            type: 'string',
            description: 'Path to package.json',
            default: './package.json'
        })
        .help()
        .alias('help', 'h')
        .example('$0', 'Release with default configuration')
        .example('$0 -a "build/**/*.js" -o releases', 'Release specific artifacts')
        .example('$0 --no-version-dirs --preserve-dirs', 'Simple copy with directory structure')
        .argv;

    try {
        // Build configuration from CLI args
        const config = {
            artifactsPattern: argv.artifacts,
            outputDir: argv.output,
            packageJsonPath: argv.package,
            createVersionDirectories: !argv.noVersionDirs,
            createLatestCopy: !argv.noLatest,
            preserveDirectory: argv.preserveDirs
        };

        // Create ReleaseManager instance
        const manager = await ReleaseManager.fromConfigFile(argv.config);

        // Override with CLI options
        Object.assign(manager.config, config);

        // Run the release
        await manager.release();

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
