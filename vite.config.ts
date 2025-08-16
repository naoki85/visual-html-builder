import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import dts from 'vite-plugin-dts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

export default defineConfig(() => {
  const isGitHubPages = process.env.NODE_ENV === 'production' && process.env.GITHUB_ACTIONS === 'true';
  
  return {
    // Base path for GitHub Pages
    base: isGitHubPages ? '/visual-html-builder/' : '/',
    
    // Build configuration
    build: isGitHubPages ? {
      // Static site build for GitHub Pages
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          demo: resolve(__dirname, 'demo/index.html')
        }
      },
      sourcemap: true,
      minify: 'terser',
      target: 'es2020',
    } : {
      // Library build configuration (standard)
      lib: {
        entry: resolve(__dirname, 'src/VisualHtmlBuilder.ts'),
        name: 'VisualHtmlBuilder',
        fileName: (format) => {
          const formatMap: Record<string, string> = {
            'es': 'index.js',
            'umd': 'index.umd.js',
            'iife': 'index.iife.js'
          };
          return formatMap[format] || `index.${format}.js`;
        },
        formats: ['es', 'umd', 'iife']
      },
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      rollupOptions: {
        external: [],
        output: {
          globals: {},
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'style.css') {
              return 'index.css';
            }
            return assetInfo.name || 'asset';
          },
          inlineDynamicImports: true
        }
      },
      target: 'es2020',
      },
  
    // TypeScript configuration
    esbuild: {
      target: 'es2020',
      format: 'esm'
    },
  
    // Development server settings
    server: {
      port: 3000,
      open: '/demo/',
      cors: true
    },
  
    // Preview settings (for post-build verification)
    preview: {
      port: 4173,
      open: true
    },
  
    // CSS configuration
    css: {
      modules: false,
      postcss: {}
    },
  
    // Resolution settings
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@helpers': resolve(__dirname, 'src/helpers')
      }
    },
  
    // Plugins
    plugins: isGitHubPages ? [] : [
      dts({
        insertTypesEntry: true,
        copyDtsFiles: false,
        outDir: 'dist',
        exclude: ['**/*.test.ts', '**/*.spec.ts', 'demo/**/*', 'vite.config.ts']
      })
    ],
  
    // Definitions (environment variables, etc.)
    define: {
      __VERSION__: JSON.stringify('1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString())
    }
  };
});
