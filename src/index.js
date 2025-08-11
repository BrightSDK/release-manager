// LICENSE_CODE ZON

/**
 * Release Manager - Artifact management and distribution tool
 *
 * Features:
 * - Takes pre-built artifacts and organizes them for release
 * - Multiple versioning strategies (major, minor, patch)
 * - Flexible file naming and directory structures
 * - Works with any bundler (webpack, rollup, esbuild, etc.)
 * - CDN-ready file organization
 */

const fs = require('fs-extra');
const path = require('path');
const { glob } = require('glob');

class ReleaseManager {
    constructor(config = {}) {
        this.config = {
            // Default configuration
            artifactsPattern: 'dist/**/*.{js,css,map}',
            outputDir: 'releases',
            packageJsonPath: './package.json',
            createVersionDirectories: true,
            createLatestCopy: true,
            createVersionedCopy: true,
            fileNameTemplate: '{basename}-{version}{ext}',
            latestFileTemplate: '{basename}-latest{ext}',
            versionDirectories: ['major', 'minor', 'patch'],
            preserveDirectory: false,
            copySourceMaps: true,
            generateManifest: true,
            ...config
        };

        this.packageInfo = this.loadPackageInfo();
        this.version = this.parseVersion(this.packageInfo.version);
    }

    loadPackageInfo() {
        const pkgPath = path.resolve(this.config.packageJsonPath);
        if (!fs.existsSync(pkgPath)) {
            throw new Error(`Package.json not found at ${pkgPath}`);
        }
        return require(pkgPath);
    }

    parseVersion(versionString) {
        const [major, minor, patch] = versionString.split('.');
        return {
            full: versionString,
            major: major,
            minor: `${major}.${minor}`,
            patch: versionString,
            majorNum: parseInt(major),
            minorNum: parseInt(minor),
            patchNum: parseInt(patch)
        };
    }

    async findArtifacts() {
        const files = await glob(this.config.artifactsPattern);
        if (files.length === 0) {
            throw new Error(`No artifacts found matching pattern: ${this.config.artifactsPattern}`);
        }
        return files;
    }

    formatFileName(template, options = {}) {
        const basename = options.basename || path.parse(options.filename || '').name;
        const ext = options.ext || path.parse(options.filename || '').ext;
        const version = options.version || this.version.full;

        return template
            .replace('{basename}', basename)
            .replace('{filename}', options.filename || basename + ext)
            .replace('{version}', version)
            .replace('{major}', this.version.major)
            .replace('{minor}', this.version.minor)
            .replace('{patch}', this.version.patch)
            .replace('{ext}', ext);
    }

    async copyArtifact(sourceFile, targetDir, options = {}) {
        const parsedPath = path.parse(sourceFile);
        const relativeSource = path.relative(process.cwd(), sourceFile);

        const outputs = [];

        // Preserve directory structure if configured
        let subDir = '';
        if (this.config.preserveDirectory) {
            const artifactBase = path.dirname(this.config.artifactsPattern.split('*')[0]);
            subDir = path.relative(artifactBase, parsedPath.dir);
        }

        const outputBaseDir = path.join(targetDir, subDir);
        if (!fs.existsSync(outputBaseDir)) {
            await fs.ensureDir(outputBaseDir);
        }

        // Create versioned copy if configured
        if (this.config.createVersionedCopy) {
            const versionedName = this.formatFileName(this.config.fileNameTemplate, {
                basename: parsedPath.name,
                ext: parsedPath.ext,
                version: options.version || this.version.full,
                filename: parsedPath.base
            });

            const versionedPath = path.join(outputBaseDir, versionedName);
            const versionedDir = path.dirname(versionedPath);
            if (!fs.existsSync(versionedDir)) {
                await fs.ensureDir(versionedDir);
            }
            await fs.copy(sourceFile, versionedPath);
            outputs.push(versionedPath);
        }

        // Create latest copy if configured
        if (this.config.createLatestCopy && options.createLatest !== false) {
            const latestName = this.formatFileName(this.config.latestFileTemplate, {
                basename: parsedPath.name,
                ext: parsedPath.ext,
                filename: parsedPath.base
            });

            const latestPath = path.join(outputBaseDir, latestName);
            const latestDir = path.dirname(latestPath);
            if (!fs.existsSync(latestDir)) {
                await fs.ensureDir(latestDir);
            }
            await fs.copy(sourceFile, latestPath);
            outputs.push(latestPath);
        }

        return outputs;
    }

    async processArtifact(sourceFile) {
        console.log(`📦 Processing: ${path.relative(process.cwd(), sourceFile)}`);

        const allOutputs = [];

        // Create version directories if configured
        if (this.config.createVersionDirectories) {
            for (const versionType of this.config.versionDirectories) {
                const versionValue = this.version[versionType];
                const versionDir = path.join(this.config.outputDir, `v${versionValue}`);

                // For version directories, just copy the original file without version suffix
                const parsedPath = path.parse(sourceFile);
                const outputPath = path.join(versionDir, parsedPath.base);

                await fs.ensureDir(versionDir);
                await fs.copy(sourceFile, outputPath);
                allOutputs.push(outputPath);
            }
        }

        // Copy to root output directory
        const rootOutputs = await this.copyArtifact(sourceFile, this.config.outputDir);
        allOutputs.push(...rootOutputs);

        return allOutputs;
    }

    async generateManifest(allOutputs) {
        if (!this.config.generateManifest) return null;

        const manifest = {
            package: this.packageInfo.name,
            version: this.version.full,
            generatedAt: new Date().toISOString(),
            files: allOutputs.map(filePath => ({
                path: path.relative(this.config.outputDir, filePath),
                size: fs.statSync(filePath).size,
                type: path.extname(filePath).slice(1)
            })),
            versions: {
                major: this.version.major,
                minor: this.version.minor,
                patch: this.version.patch
            }
        };

        const manifestPath = path.join(this.config.outputDir, 'manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

        console.log(`📋 Generated manifest: ${path.relative(process.cwd(), manifestPath)}`);
        return manifestPath;
    }

    async release() {
        try {
            console.log(`🚀 Starting release for ${this.packageInfo.name} v${this.version.full}`);

        // Ensure output directory exists
        await fs.ensureDir(this.config.outputDir);            // Find and process artifacts
            const artifacts = await this.findArtifacts();
            console.log(`📁 Found ${artifacts.length} artifact(s)`);

            const allOutputs = [];

            for (const artifact of artifacts) {
                const outputs = await this.processArtifact(artifact);
                allOutputs.push(...outputs);
            }

            // Generate manifest
            const manifestPath = await this.generateManifest(allOutputs);
            if (manifestPath) {
                allOutputs.push(manifestPath);
            }

            console.log(`✅ Release completed successfully!`);
            console.log(`📦 Files created:`);
            allOutputs.forEach(file => console.log(`   - ${path.relative(process.cwd(), file)}`));

            return allOutputs;

        } catch (error) {
            console.error('❌ Release failed:', error.message);
            throw error;
        }
    }

    // Static method to create instance from config file
    static async fromConfigFile(configPath = './release.config.js') {
        const fullPath = path.resolve(configPath);

        if (fs.existsSync(fullPath)) {
            const config = require(fullPath);
            return new ReleaseManager(config);
        }

        // Return default instance if no config file found
        return new ReleaseManager();
    }
}

module.exports = ReleaseManager;
