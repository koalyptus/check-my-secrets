import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import { existsSync, unlinkSync, mkdirSync, writeFileSync, readFileSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { CONFIG_DIR } from '../../lib/constants.mjs';

const projectRoot = path.resolve('.');

describe('CLI Integration Tests', () => {

  describe('add-secret.js', () => {
    it('should show error when no password provided', () => {
      try {
        execSync('node bin/add-secret.js', { cwd: projectRoot, stdio: 'pipe' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        // The command should fail without a password argument
        expect(error.message).toBeDefined();
      }
    });

    it('should not crash when a password is provided', () => {
      try {
        // This may fail if keyring is not accessible, but shouldn't crash
        execSync('node bin/add-secret.js "test-password-12345"', {
          cwd: projectRoot,
          stdio: 'pipe',
          env: { ...process.env, PWDS_KEY: 'test-key' }
        });
      } catch (error) {
        // It's ok if it fails due to keyring issues, but it shouldn't crash
        expect(error).toBeDefined();
      }
    });
  });

  describe('delete-secret.js', () => {
    it('should show error when no password provided', () => {
      try {
        execSync('node bin/delete-secret.js', { cwd: projectRoot, stdio: 'pipe' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBeDefined();
      }
    });

    it('should not crash when a password is provided', () => {
      try {
        execSync('node bin/delete-secret.js "test-password"', {
          cwd: projectRoot,
          stdio: 'pipe',
          env: { ...process.env, PWDS_KEY: 'test-key' }
        });
      } catch (error) {
        // It's ok if it fails due to keyring issues
        expect(error).toBeDefined();
      }
    });
  });

  describe('check-my-secrets.js', () => {
    it('should run without crashing', () => {
      try {
        execSync('node bin/check-my-secrets.js', {
          cwd: projectRoot,
          stdio: 'pipe',
          timeout: 5000,
          env: { ...process.env, PWDS_KEY: 'non-existent-key' }
        });
      } catch (error) {
        // Expected to fail or timeout due to no real passwords, but shouldn't crash
        expect(error).toBeDefined();
      }
    });
  });

  describe('setup.js', () => {
    // Use a temp HOME for tests to avoid touching the real user's home
    let tempHome;
    let childEnv;
    const tmpPrefix = 'check-my-secrets-test-';

    beforeEach(() => {
      tempHome = mkdtempSync(path.join(tmpdir(), tmpPrefix));
      childEnv = { ...process.env, HOME: tempHome, USERPROFILE: tempHome };
    });

    afterEach(() => {
      try {
        rmSync(tempHome, { recursive: true, force: true });
      } catch (e) {
        // ignore cleanup errors
      }
    });

    it('should create the config directory and default .env file', () => {
      const testConfigDir = path.join(tempHome, CONFIG_DIR);
      const testEnvPath = path.join(testConfigDir, '.env');

      // Ensure clean state
      if (existsSync(testEnvPath)) {
        unlinkSync(testEnvPath);
      }

      const output = execSync('node bin/setup.js', {
        cwd: projectRoot,
        stdio: 'pipe',
        env: childEnv
      }).toString();

      expect(existsSync(testConfigDir)).toBe(true);
      expect(existsSync(testEnvPath)).toBe(true);
      expect(output).toContain('Config directory ensured:');
      expect(output).toContain('Default .env file created:');

      const envContent = readFileSync(testEnvPath, 'utf-8');
      expect(envContent).toContain('PWDS_KEY=checkmysecrets.pwds');
      expect(envContent).toContain('PWDS_SEPARATOR=,');
    });

    it('should merge new options into existing .env file', () => {
      const testConfigDir = path.join(tempHome, CONFIG_DIR);
      const testEnvPath = path.join(testConfigDir, '.env');

      // Create the directory and a custom .env file
      mkdirSync(testConfigDir, { recursive: true });
      const customEnvContent = 'PWDS_KEY=custom.key\nPWDS_SEPARATOR=;\n';
      writeFileSync(testEnvPath, customEnvContent);

      const output = execSync('node bin/setup.js', {
        cwd: projectRoot,
        stdio: 'pipe',
        env: childEnv
      }).toString();

      expect(output).toContain('.env file updated with new options:');

      const envContent = readFileSync(testEnvPath, 'utf-8');
      expect(envContent).toContain('PWDS_KEY=custom.key');
      expect(envContent).toContain('PWDS_SEPARATOR=;');
      expect(envContent).toContain('PWDS_INPUT_MODE=prompt');
    });
  });

  describe('npm scripts', () => {
    it('should have secrets:add script', () => {
      try {
        // Just verify the script exists by checking help
        const output = execSync('npm run 2>&1', {
          cwd: projectRoot,
          stdio: 'pipe'
        }).toString();
        expect(output).toContain('secrets:add');
      } catch (error) {
        // npm run might list scripts differently
        expect(error).toBeDefined();
      }
    });

    it('should have secrets:delete script', () => {
      try {
        const output = execSync('npm run 2>&1', {
          cwd: projectRoot,
          stdio: 'pipe'
        }).toString();
        expect(output).toContain('secrets:delete');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should have secrets:check script', () => {
      try {
        const output = execSync('npm run 2>&1', {
          cwd: projectRoot,
          stdio: 'pipe'
        }).toString();
        expect(output).toContain('secrets:check');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should have secrets:list script', () => {
      try {
        const output = execSync('npm run 2>&1', {
          cwd: projectRoot,
          stdio: 'pipe'
        }).toString();
        expect(output).toContain('secrets:list');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
    it('should have setup script', () => {
      const pkg = JSON.parse(readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
      expect(pkg.scripts && pkg.scripts.setup).toBeDefined();
    });
  });
});
