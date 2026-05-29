# Release Manager

A universal artifact management and distribution tool for organizing pre-built files into CDN-ready release structure. Works with any bundler (webpack, rollup, esbuild, etc.) by processing already-built artifacts.

## Features

- 📦 **Universal Compatibility**: Works with artifacts from any bundler
- 🗂️ **Directory-Based Organization**: Creates separate directories for each version level
- 📝 **Individual Manifests**: Generates manifest files for each version directory
- 🏷️ **Complete Versioning**: Creates major, minor, patch, and latest directories by default
- 📁 **Directory Preservation**: Maintains source directory structures when needed
- 🎯 **Pattern Matching**: Uses glob patterns for flexible artifact selection
- ✅ **Alphabetical Output**: Files are listed in sorted order for better readability

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
- Create 4 version directories: `v1/`, `v1.2/`, `v1.2.3/`, `latest/`
- Copy files to each directory with individual manifests
- Organize them for CDN deployment

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

# 2. Organize artifacts (only specific directories)
release-manager --artifacts "out/*.js" --version-dirs "major,latest"
```

## Configuration

### CLI Options

```bash
release-manager [options]

Options:
  --artifacts <pattern>     Glob pattern for artifacts (default: "dist/**/*.{js,css,map}")
  --output <dir>           Output directory (default: "releases")
  --preserve-dirs          Preserve directory structure from artifacts
  --version-dirs <list>    Comma-separated list of version directories to create
                          (options: major,minor,patch,latest - default: all)
  --no-manifest            Skip generating manifest files
  --config <file>          Path to config file
```

### Configuration File

Create a `release.config.js` file for minimal configuration:

```javascript
module.exports = {
  // Glob pattern to find artifacts
  artifactsPattern: 'dist/**/*.{js,css,map}',

  // All other options have sensible defaults:
  // - outputDir: 'releases'
  // - versionDirectories: ['major', 'minor', 'patch', 'latest']
  // - preserveDirectory: false
  // - generateManifest: true
};
```

### Advanced Configuration

```javascript
module.exports = {
  // Required: Pattern to find your artifacts
  artifactsPattern: 'dist/**/*.{js,css,map}',

  // Optional: Output directory (default: 'releases')
  outputDir: 'releases',

  // Optional: Which version directories to create (default: all)
  versionDirectories: ['major', 'minor', 'patch', 'latest'],

  // Optional: Preserve directory structure (default: false)
  preserveDirectory: true,

  // Optional: Generate manifest files (default: true)
  generateManifest: true,
};
```

## File Organization

The release manager creates a clean directory structure for your artifacts:

```
releases/
├── v1/                        # Major version directory (1.x.x)
│   ├── app.js                 # Original artifact files
│   ├── styles.css
│   └── manifest.json          # Directory manifest with file list
├── v1.2/                      # Minor version directory (1.2.x)
│   ├── app.js
│   ├── styles.css
│   └── manifest.json
├── v1.2.3/                    # Exact version directory
│   ├── app.js
│   ├── styles.css
│   └── manifest.json
└── latest/                    # Latest version directory
    ├── app.js
    ├── styles.css
    └── manifest.json
```

### Manifest Files

Each directory contains a `manifest.json` with metadata:

```json
{
  "version": "1.2.3",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "files": ["app.js", "styles.css"]
}
```

Files are listed alphabetically for consistent ordering.

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

      - name: Build
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
    "release": "npm run build && release-manager"
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
  preserveDirectory: true,
});

// Find artifacts without processing
const artifacts = await manager.findArtifacts();
console.log('Found artifacts:', artifacts);

// Process specific files
for (const artifact of artifacts) {
  if (artifact.endsWith('.js')) {
    await manager.processArtifact(artifact, {
      createVersioned: true,
      createLatest: false,
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

## Common Use Cases

### CDN Distribution

Perfect for organizing files for CDN distribution with semantic versioning:

```javascript
// Users can reference specific versions
https://cdn.example.com/my-lib/v1/bundle.js      // Latest v1.x.x
https://cdn.example.com/my-lib/v1.2/bundle.js    // Latest v1.2.x
https://cdn.example.com/my-lib/v1.2.3/bundle.js  // Exact version
https://cdn.example.com/my-lib/latest/bundle.js  // Always latest
```

### Library Distribution

Organize library builds for different consumption patterns:

```javascript
module.exports = {
  artifactsPattern: 'lib/**/*.{js,d.ts,css}',
  preserveDirectory: true, // Keep lib/ structure
  versionDirectories: ['major', 'latest'], // Only major + latest
};
```

### Documentation Hosting

Organize documentation builds:

```javascript
module.exports = {
  artifactsPattern: 'docs/**/*.{html,css,js}',
  outputDir: 'gh-pages',
  preserveDirectory: true,
};
```

## Advanced Features

### Directory Structure Preservation

When `preserveDirectory: true`, maintains the original structure:

```
# Input
dist/
├── js/app.js
└── css/styles.css

# Output
releases/
├── v1.2.3/
│   ├── js/app.js
│   └── css/styles.css
└── latest/
    ├── js/app.js
    └── css/styles.css
```

### Selective Version Directories

Control which version directories are created:

```javascript
module.exports = {
  artifactsPattern: 'dist/**/*.js',
  versionDirectories: ['major', 'latest'], // Only v1/ and latest/
};
```

## Best Practices

1. **Build First**: Always build your project before running Release Manager
2. **Minimal Configuration**: Start with just `artifactsPattern` - defaults handle the rest
3. **Version Control**: Include `release.config.js` in version control
4. **CDN Optimization**: Use directory structure for clean CDN URLs
5. **Testing**: Test with different bundlers to ensure compatibility
6. **CI/CD Integration**: Automate releases in your deployment pipeline

## Troubleshooting

### Common Issues

**No artifacts found**

- Check your `artifactsPattern` glob matches your build output
- Ensure artifacts exist before running release manager

**Permission errors**

- Make sure output directory is writable
- Check file permissions on source artifacts

**Memory issues with large files**

- Process artifacts in smaller batches
- Use more specific glob patterns

## License

MIT

## Contributing

Pull requests are welcome! Please ensure tests pass and follow the existing code style.
