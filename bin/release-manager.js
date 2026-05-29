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
      default: './release.config.js',
    })
    .option('artifacts', {
      alias: 'a',
      type: 'string',
      description: 'Artifacts pattern to process',
      default: 'dist/**/*.{js,css,map}',
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      description: 'Output directory',
      default: 'releases',
    })
    .option('no-version-dirs', {
      type: 'boolean',
      description: 'Skip creating version directories',
      default: false,
    })
    .option('no-latest', {
      type: 'boolean',
      description: 'Skip creating latest files',
      default: false,
    })
    .option('preserve-dirs', {
      type: 'boolean',
      description: 'Preserve directory structure from artifacts',
      default: false,
    })
    .option('package', {
      alias: 'p',
      type: 'string',
      description: 'Path to package.json',
      default: './package.json',
    })
    .help()
    .alias('help', 'h')
    .example('$0', 'Release with default configuration')
    .example('$0 -a "build/**/*.js" -o releases', 'Release specific artifacts')
    .example(
      '$0 --no-version-dirs --preserve-dirs',
      'Simple copy with directory structure',
    ).argv;

  try {
    // Create ReleaseManager instance from config file first
    const manager = await ReleaseManager.fromConfigFile(argv.config);

    // Only override with CLI args if explicitly provided (not defaults)
    if (argv.artifacts !== 'dist/**/*.{js,css,map}') {
      manager.config.artifactsPattern = argv.artifacts;
    }
    if (argv.output !== 'releases') {
      manager.config.outputDir = argv.output;
    }
    if (argv.package !== './package.json') {
      manager.config.packageJsonPath = argv.package;
    }
    if (argv.noVersionDirs) {
      manager.config.createVersionDirectories = false;
    }
    if (argv.noLatest) {
      manager.config.createLatestCopy = false;
    }
    if (argv.preserveDirs) {
      manager.config.preserveDirectory = true;
    }

    // Run the release
    await manager.release();

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
