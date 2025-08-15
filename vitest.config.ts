import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

export default defineConfig({
  // Vitest設定
  test: {
    // DOM環境の設定
    environment: 'jsdom',
    
    // グローバルAPIの有効化（describe, it, expect等）
    globals: true,
    
    // セットアップファイル（必要に応じて）
    // setupFiles: ['./tests/setup.ts'],
    
    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        'demo/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/vite-env.d.ts',
        'vite.config.ts',
        'vitest.config.ts'
      ],
      // カバレッジ閾値
      thresholds: {
        global: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80
        }
      }
    },
    
    // テストファイルのパターン
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'src/**/*.{test,spec}.{js,ts}'
    ],
    
    // 除外ファイル
    exclude: [
      'node_modules',
      'dist',
      'demo'
    ],
    
    // タイムアウト設定
    testTimeout: 10000,
    
    // 並列実行設定
    pool: 'threads',
    
    // レポーター設定
    reporters: ['verbose', 'html'],
    
    // DOM設定
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000'
      }
    }
  },
  
  // 解決設定（本体と同じ）
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@helpers': resolve(__dirname, 'src/helpers')
    }
  },
  
  // ESBuild設定
  esbuild: {
    target: 'es2020'
  }
});