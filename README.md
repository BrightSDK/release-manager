# Release Manager

A universal artifact management and distribution tool for organizing pre-built files into CDN-ready release structure. Works with any bundler (webpack, rollup, esbuild, etc.) by processing already-built artifacts.

## Features

- 📦 **Universal Compatibility**: Works with artifacts from any bundler
- 🗂️ **Intelligent Organization**: Organizes artifacts into versioned directory structures
- 🏷️ **Flexible Naming**: Customizable file naming with version placeholders
- 📝 **Manifest Generation**: Creates detailed manifest files for releases
- 🔄 **Latest Copies**: Automatically creates latest version links
- 📁 **Directory Preservation**: Maintains source directory structures when needed
- 🎯 **Pattern Matching**: Uses glob patterns for flexible artifact selection

## Installation

```bash
npm install -g https://brightsdk.github.io/packages/bright-sdk-tool-release-manager/latest.tgz
```

Or as a development dependency:

```bash
npm install --save-dev https://brightsdk.github.io/packages/bright-sdk-tool-release-manager/latest.tgz
```

## Quick Start

1. Build your project with any bundler (webpack, rollup, esbuild, etc.)
2. Use Release Manager to organize the built artifacts:

```bash
release-manager --artifacts "dist/**/*.{js,css,map}"
```

This will:
- Find all JS, CSS, and map files in your `dist` directory
- Create versioned copies (e.g., `bundle-1.2.3.min.js`)
- Create latest copies (e.g., `bundle-latest.min.js`)
- Organize them in version directories (e.g., `releases/v1.2/`)
- Generate a manifest file

## Usage Examples

### With Webpack

```bash
# 1. Build with webpack
npx webpack --mode production

# 2. Organize artifacts
release-manager --artifacts "dist/*.{js,css}"
```

### With Rollup

```bash
# 1. Build with rollup
npx rollup -c

# 2. Organize artifacts (preserving directory structure)
release-manager --artifacts "build/**/*" --preserve-dirs
```

### With esbuild

```bash
# 1. Build with esbuild
npx esbuild src/index.js --bundle --outdir=out

# 2. Organize artifacts
release-manager --artifacts "out/*.js" --no-latest
```

## Configuration

### CLI Options

```bash
release-manager [options]

Options:
  --artifacts <pattern>     Glob pattern for artifacts (default: "dist/**/*.{js,css,map}")
  --output <dir>           Output directory (default: "releases")
  --preserve-dirs          Preserve directory structure from artifacts
  --no-version-dirs        Skip creating version directories
  --no-versioned           Skip creating versioned copies
  --no-latest              Skip creating latest copies
  --no-manifest            Skip generating manifest file
  --config <file>          Path to config file
```

### Configuration File

Create a `release.config.js` file:

```javascript
module.exports = {
  // Glob pattern to find artifacts
  artifactsPattern: 'dist/**/*.{js,css,map}',

  // Output directory for releases
  outputDir: 'releases',

  // Version directory options
  createVersionDirectories: true,
  versionDirectories: ['major', 'minor', 'patch'],
  versionDirectoryTemplate: 'v{version}',

  // File copying options
  createVersionedCopy: true,
  createLatestCopy: true,
  preserveDirectory: false,

  // File naming templates
  versionedFileTemplate: '{basename}-{version}{ext}',
  latestFileTemplate: '{basename}-latest{ext}',

  // Manifest options
  generateManifest: true,
  manifestFileName: 'manifest.json',

  // Custom package.json path
  packageJsonPath: './package.json'
};
```

## Integration Examples

### GitHub Actions Workflow

```yaml
name: Build and Release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build with webpack
        run: npm run build

      - name: Organize artifacts
        run: npx @brightsdk/release-manager

      - name: Upload to CDN
        run: aws s3 sync releases/ s3://my-cdn-bucket/
```

### npm Scripts Integration

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "release": "npm run build && release-manager",
    "release:dev": "webpack --mode development && release-manager --no-latest"
  }
}
```

## API Usage

### Programmatic Usage

```javascript
const ReleaseManager = require('@brightsdk/release-manager');

const manager = new ReleaseManager({
  artifactsPattern: 'dist/**/*.{js,css}',
  outputDir: 'releases',
  createVersionedCopy: true,
  createLatestCopy: true
});

async function release() {
  try {
    await manager.release();
    console.log('Release completed successfully!');
  } catch (error) {
    console.error('Release failed:', error);
  }
}

release();
```

### Custom Processing

```javascript
const manager = new ReleaseManager({
  artifactsPattern: 'build/**/*',
  outputDir: 'cdn',
  preserveDirectory: true
});

// Find artifacts without processing
const artifacts = await manager.findArtifacts();
console.log('Found artifacts:', artifacts);

// Process specific files
for (const artifact of artifacts) {
  if (artifact.endsWith('.js')) {
    await manager.processArtifact(artifact, {
      createVersioned: true,
      createLatest: false
    });
  }
}
```

## File Organization

The Release Manager creates a structured output:

```
releases/
├── manifest.json                    # Release manifest
├── bundle-1.2.3.min.js            # Versioned files
├── bundle-latest.min.js            # Latest copies
├── styles-1.2.3.css
├── styles-latest.css
├── v1/                             # Major version directory
│   ├── bundle.min.js
│   └── styles.css
├── v1.2/                           # Minor version directory
│   ├── bundle.min.js
│   └── styles.css
└── v1.2.3/                         # Full version directory
    ├── bundle.min.js
    └── styles.css
```

## Version Placeholders

Use these placeholders in file naming templates:

- `{basename}` - Original filename without extension
- `{ext}` - File extension
- `{version}` - Full version (e.g., "1.2.3")
- `{major}` - Major version (e.g., "1")
- `{minor}` - Minor version (e.g., "1.2")
- `{patch}` - Full version (same as {version})

## Manifest File

Generated manifest contains:

```json
{
  "package": "@my/package",
  "version": "1.2.3",
  "timestamp": "2023-11-20T10:30:00.000Z",
  "files": [
    {
      "path": "bundle-1.2.3.min.js",
      "size": 15432,
      "hash": "sha256:abc123...",
      "type": "versioned"
    },
    {
      "path": "bundle-latest.min.js",
      "size": 15432,
      "hash": "sha256:abc123...",
      "type": "latest"
    }
  ]
}
```

## Best Practices

1. **Build First**: Always build your project before running Release Manager
2. **Version Control**: Include release configuration in version control
3. **CDN Optimization**: Use appropriate file patterns for your CDN structure
4. **Testing**: Test with different bundlers to ensure compatibility
5. **Automation**: Integrate into CI/CD pipelines for consistent releases

## License

MIT

## Contributing

Pull requests are welcome! Please ensure tests pass and follow the existing code style.
