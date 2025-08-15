import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import dts from 'vite-plugin-dts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

export default defineConfig({
  // Library build configuration
  build: {
    lib: {
      // Entry point - メインのTypeScriptファイル
      entry: resolve(__dirname, 'src/VisualHtmlBuilder.ts'),
      
      // ライブラリ名（UMD形式でのグローバル変数名）
      name: 'VisualHtmlBuilder',
      
      // 出力ファイル名の設定
      fileName: (format) => {
        const formatMap: Record<string, string> = {
          'es': 'index.js',           // ES Modules版
          'umd': 'index.umd.js',      // ブラウザ用UMD版
          'iife': 'index.iife.js'     // 即座実行版（CDN用）
        };
        return formatMap[format] || `index.${format}.js`;
      },
      
      // 出力形式の指定
      formats: ['es', 'umd', 'iife']
    },
    
    // 出力ディレクトリ
    outDir: 'dist',
    
    // ソースマップの生成
    sourcemap: true,
    
    // ファイルの最小化
    minify: 'terser',
    
    // Rollup特有の設定
    rollupOptions: {
      // 外部依存関係（バンドルに含めない）
      external: [], // 現在は依存関係なし
      
      output: {
        // グローバル変数のマッピング（UMD形式用）
        globals: {},
        
        // アセットファイル名の設定
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'index.css';
          }
          return assetInfo.name || 'asset';
        },
        inlineDynamicImports: true
      }
    },
    
    // ビルド対象の指定
    target: 'es2020',
  },
  
  // TypeScript設定
  esbuild: {
    target: 'es2020',
    format: 'esm'
  },
  
  // 開発サーバー設定
  server: {
    port: 3000,
    open: '/demo/',
    cors: true
  },
  
  // プレビュー設定（build後の確認用）
  preview: {
    port: 4173,
    open: true
  },
  
  // CSS設定
  css: {
    // CSS Modulesが必要な場合
    modules: false,
    
    // PostCSS設定
    postcss: {}
  },
  
  // 解決設定
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@helpers': resolve(__dirname, 'src/helpers')
    }
  },
  
  // プラグイン
  plugins: [
    dts({
      insertTypesEntry: true,
      copyDtsFiles: false,
      outDir: 'dist',
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'demo/**/*', 'vite.config.ts']
    })
  ],
  
  // 定義（環境変数など）
  define: {
    __VERSION__: JSON.stringify('1.0.0'),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  }
});
