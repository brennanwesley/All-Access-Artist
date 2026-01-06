/**
 * Vitest Configuration
 * All Access Artist - Backend Testing Infrastructure
 * 
 * This configuration sets up Vitest for testing the backend API.
 * 
 * Key settings:
 * - globals: true - Allows using describe/it/expect without imports
 * - environment: 'node' - Tests run in Node.js environment
 * - include: Tests are located in __tests__ folders or *.test.ts files
 * - exclude: Ignores node_modules and dist folders
 * 
 * Usage:
 * - npm test          : Run all tests once
 * - npm run test:watch: Run tests in watch mode (re-runs on file changes)
 * - npm run test:coverage: Run tests with coverage report
 */

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Enable global test functions (describe, it, expect) without imports
    globals: true,
    
    // Use Node.js environment for backend tests
    environment: 'node',
    
    // Where to find test files
    include: [
      'src/**/__tests__/**/*.test.ts',
      'src/**/*.test.ts'
    ],
    
    // Folders to ignore
    exclude: [
      'node_modules',
      'dist'
    ],
    
    // Root directory for tests
    root: '.',
    
    // Coverage configuration (optional, for test:coverage script)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules',
        'dist',
        '**/__tests__/**',
        '**/*.test.ts'
      ]
    }
  }
})
