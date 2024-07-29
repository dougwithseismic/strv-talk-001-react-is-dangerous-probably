const esbuild = require('esbuild')
const fg = require('fast-glob')

async function build() {
    // Common configurations
    const commonConfig = {
        bundle: true,
        outbase: 'src',
    }

    try {
        // Build the main application for Node.js
        await esbuild.build({
            ...commonConfig,
            entryPoints: await fg('src/**/*.ts'),
            platform: 'node',
            outdir: 'dist',
        })
    } catch (error) {
        console.error('An error occurred during the build process:', error)
        process.exit(1)
    }
}

build()
