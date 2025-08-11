const ReleaseManager = require('../src/index.js');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

describe('ReleaseManager', () => {
    let tempDir;
    let testPackageJson;

    beforeEach(async () => {
        // Create temporary directory for tests
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'release-manager-test-'));

        // Create test package.json
        testPackageJson = {
            name: '@test/sample-package',
            version: '1.2.3'
        };

        await fs.writeJson(path.join(tempDir, 'package.json'), testPackageJson);

        // Create test artifacts (pre-built files)
        const distDir = path.join(tempDir, 'dist');
        await fs.ensureDir(distDir);

        // Create sample JS artifact
        await fs.writeFile(
            path.join(distDir, 'bundle.min.js'),
            '!function(){console.log("Minified bundle")}();'
        );

        // Create sample CSS artifact
        await fs.writeFile(
            path.join(distDir, 'styles.min.css'),
            'body{margin:0;padding:0;font-family:Arial}'
        );

        // Create source map
        await fs.writeFile(
            path.join(distDir, 'bundle.min.js.map'),
            '{"version":3,"sources":["bundle.js"],"names":[],"mappings":"test"}'
        );

        // Change to temp directory
        process.chdir(tempDir);
    });

    afterEach(async () => {
        // Clean up temp directory
        await fs.remove(tempDir);
    });

    describe('constructor', () => {
        test('should initialize with default config', () => {
            const manager = new ReleaseManager();
            expect(manager.config.artifactsPattern).toBe('dist/**/*.{js,css,map}');
            expect(manager.config.outputDir).toBe('releases');
            expect(manager.config.versionDirectories).toEqual(['major', 'minor', 'patch', 'latest']);
        });

        test('should merge custom config with defaults', () => {
            const customConfig = {
                artifactsPattern: 'build/**/*.js',
                preserveDirectory: true
            };
            const manager = new ReleaseManager(customConfig);

            expect(manager.config.artifactsPattern).toBe('build/**/*.js');
            expect(manager.config.preserveDirectory).toBe(true);
            expect(manager.config.outputDir).toBe('releases'); // default preserved
        });
    });

    describe('version parsing', () => {
        test('should parse version correctly', () => {
            const manager = new ReleaseManager();
            const version = manager.parseVersion('1.2.3');

            expect(version.full).toBe('1.2.3');
            expect(version.major).toBe('1');
            expect(version.minor).toBe('1.2');
            expect(version.patch).toBe('1.2.3');
            expect(version.majorNum).toBe(1);
            expect(version.minorNum).toBe(2);
            expect(version.patchNum).toBe(3);
        });
    });

    describe('file name formatting', () => {
        test('should format file names with placeholders', () => {
            const manager = new ReleaseManager();

            const result = manager.formatFileName('{basename}-{version}{ext}', {
                basename: 'bundle',
                ext: '.min.js'
            });

            expect(result).toBe('bundle-1.2.3.min.js');
        });

        test('should handle version placeholders', () => {
            const manager = new ReleaseManager();

            const result = manager.formatFileName('{basename}-v{major}{ext}', {
                basename: 'styles',
                ext: '.css'
            });

            expect(result).toBe('styles-v1.css');
        });
    });

    describe('artifact processing', () => {
        test('should find and process artifacts', async () => {
            const manager = new ReleaseManager({
                artifactsPattern: 'dist/**/*.{js,css,map}',
                outputDir: 'releases'
            });

            const artifacts = await manager.findArtifacts();
            expect(artifacts).toHaveLength(3); // JS, CSS, and map file
            expect(artifacts.some(f => f.includes('bundle.min.js'))).toBe(true);
            expect(artifacts.some(f => f.includes('styles.min.css'))).toBe(true);
        });

        test('should create versioned and latest copies', async () => {
            const manager = new ReleaseManager({
                artifactsPattern: 'dist/bundle.min.js',
                outputDir: 'releases',
                versionDirectories: ['patch', 'latest'] // This will create v1.2.3 and latest directories
            });

            await manager.release();

            // Check if files were created in new directory structure
            const versionedFile = path.join('releases', 'v1.2.3', 'bundle.min.js');
            const latestFile = path.join('releases', 'latest', 'bundle.min.js');

            expect(await fs.pathExists(versionedFile)).toBe(true);
            expect(await fs.pathExists(latestFile)).toBe(true);

            // Check content was copied correctly
            const originalContent = await fs.readFile('dist/bundle.min.js', 'utf8');
            const versionedContent = await fs.readFile(versionedFile, 'utf8');
            expect(versionedContent).toBe(originalContent);
        });

        test('should create version directories', async () => {
            const manager = new ReleaseManager({
                artifactsPattern: 'dist/bundle.min.js',
                outputDir: 'releases',
                createVersionDirectories: true,
                versionDirectories: ['major', 'minor']
            });

            await manager.release();

            // Check version directories
            expect(await fs.pathExists('releases/v1')).toBe(true);
            expect(await fs.pathExists('releases/v1.2')).toBe(true);
            // Files in version directories should have clean names (no version suffix)
            expect(await fs.pathExists('releases/v1/bundle.min.js')).toBe(true);
            expect(await fs.pathExists('releases/v1.2/bundle.min.js')).toBe(true);
        });

        test('should preserve directory structure when configured', async () => {
            // Create nested artifact
            const nestedDir = path.join('dist', 'components');
            await fs.ensureDir(nestedDir);
            await fs.writeFile(
                path.join(nestedDir, 'component.js'),
                'export const Component = () => {};'
            );

            const manager = new ReleaseManager({
                artifactsPattern: 'dist/**/*.js',
                outputDir: 'releases',
                preserveDirectory: true,
                versionDirectories: ['patch'] // Use patch to get v1.2.3 directory
            });

            await manager.release();

            // Check if directory structure is preserved in new structure
            expect(await fs.pathExists('releases/v1.2.3/dist/components/component.js')).toBe(true);
        });

        test('should generate manifest file', async () => {
            const manager = new ReleaseManager({
                artifactsPattern: 'dist/**/*.{js,css}',
                outputDir: 'releases',
                versionDirectories: ['patch'] // Use patch to get v1.2.3 directory
            });

            await manager.release();

            // Check manifest exists in version directory
            const manifestPath = path.join('releases', 'v1.2.3', 'manifest.json');
            expect(await fs.pathExists(manifestPath)).toBe(true);

            const manifest = await fs.readJson(manifestPath);
            expect(manifest.package).toBe('@test/sample-package');
            expect(manifest.version).toBe('1.2.3');
            expect(manifest.files).toHaveLength(2); // Just the files in this directory
            expect(manifest.files.some(f => f.path.includes('bundle'))).toBe(true);
        });
    });

    describe('error handling', () => {
        test('should throw error for missing package.json', () => {
            expect(() => {
                new ReleaseManager({
                    packageJsonPath: './nonexistent.json'
                });
            }).toThrow('Package.json not found');
        });

        test('should throw error for no artifacts', async () => {
            const manager = new ReleaseManager({
                artifactsPattern: 'nonexistent/**/*.js'
            });

            await expect(manager.release()).rejects.toThrow('No artifacts found');
        });
    });
});
