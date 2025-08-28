#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 設定
const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const PACKAGES_DIR = path.join(WORKSPACE_ROOT, 'packages');

/**
 * パッケージ情報を取得
 */
function getPackageInfo(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return {
      name: packageJson.name,
      version: packageJson.version,
      private: packageJson.private === true,
      path: packagePath,
      publishConfig: packageJson.publishConfig || {}
    };
  } catch (error) {
    console.error(`Error reading ${packageJsonPath}:`, error.message);
    return null;
  }
}

/**
 * 全パッケージの情報を収集
 */
function getAllPackages() {
  const packages = [];
  
  if (!fs.existsSync(PACKAGES_DIR)) {
    console.error('packages directory not found');
    process.exit(1);
  }
  
  const packageDirs = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const dir of packageDirs) {
    const packagePath = path.join(PACKAGES_DIR, dir);
    const packageInfo = getPackageInfo(packagePath);
    
    if (packageInfo) {
      packages.push(packageInfo);
    }
  }
  
  return packages;
}

/**
 * changeset statusの情報を取得
 */
function getChangesetStatus() {
  try {
    // まずchangeset statusで情報を取得しようとする
    const output = execSync('npx changeset status --output=json', {
      cwd: WORKSPACE_ROOT,
      encoding: 'utf8'
    });
    return JSON.parse(output);
  } catch (error) {
    console.warn('Warning: Could not get changeset status:', error.message.split('\n')[0]);
    return null;
  }
}

/**
 * 公開対象パッケージを表示
 */
function displayPublishablePackages(packages, changesetStatus) {
  const publicPackages = packages.filter(pkg => !pkg.private);
  const privatePackages = packages.filter(pkg => pkg.private);
  
  console.log('\n=== PUBLISH VERIFICATION ===\n');
  
  // Private packages (excluded from publish)
  console.log('🔒 PRIVATE PACKAGES (will NOT be published):');
  if (privatePackages.length === 0) {
    console.log('  (none)');
  } else {
    privatePackages.forEach(pkg => {
      console.log(`  - ${pkg.name}@${pkg.version} (private: true)`);
    });
  }
  
  console.log('\n📦 PUBLIC PACKAGES:');
  if (publicPackages.length === 0) {
    console.log('  (none)');
  } else {
    publicPackages.forEach(pkg => {
      const willPublish = changesetStatus?.releases?.some(release => 
        release.name === pkg.name && release.type !== 'none'
      ) || false;
      
      const status = willPublish ? '✅ WILL BE PUBLISHED' : '⏸️  No changes';
      console.log(`  - ${pkg.name}@${pkg.version} ${status}`);
    });
  }
  
  // Show packages that will actually be published
  if (changesetStatus?.releases) {
    const packagesToPublish = changesetStatus.releases.filter(release => 
      release.type !== 'none'
    );
    
    if (packagesToPublish.length > 0) {
      console.log('\n🚀 PACKAGES TO BE PUBLISHED:');
      packagesToPublish.forEach(release => {
        console.log(`  - ${release.name}: ${release.oldVersion} → ${release.newVersion} (${release.type})`);
      });
    }
  }
}

/**
 * ユーザー確認を求める
 */
function askUserConfirmation() {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('\n⚠️  Please verify the packages listed above.');
    console.log('Make sure no private packages will be accidentally published.');
    
    rl.question('\nDo you want to continue with the publish? (y/N): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * 検証チェック
 */
function runValidationChecks(packages) {
  console.log('\n🔍 RUNNING VALIDATION CHECKS...\n');
  
  let hasErrors = false;
  
  // Check 1: Private packages should not have publishConfig.access
  const privateWithPublishConfig = packages.filter(pkg => 
    pkg.private && pkg.publishConfig.access
  );
  
  if (privateWithPublishConfig.length > 0) {
    console.error('❌ ERROR: Private packages should not have publishConfig.access:');
    privateWithPublishConfig.forEach(pkg => {
      console.error(`   - ${pkg.name} has publishConfig.access but is private`);
    });
    hasErrors = true;
  }
  
  // Check 2: Public packages should have publishConfig.access
  const publicWithoutPublishConfig = packages.filter(pkg => 
    !pkg.private && !pkg.publishConfig.access
  );
  
  if (publicWithoutPublishConfig.length > 0) {
    console.warn('⚠️  WARNING: Public packages without explicit publishConfig.access:');
    publicWithoutPublishConfig.forEach(pkg => {
      console.warn(`   - ${pkg.name} (will use default access)`);
    });
  }
  
  // Check 3: Verify private packages are properly marked
  const privatePackages = packages.filter(pkg => pkg.private);
  if (privatePackages.length > 0) {
    console.log('✅ Private packages detected and will be excluded from publish:');
    privatePackages.forEach(pkg => {
      console.log(`   - ${pkg.name} (private: true)`);
    });
  }
  
  if (!hasErrors) {
    console.log('✅ All validation checks passed!');
  }
  
  return !hasErrors;
}

/**
 * メイン処理
 */
async function main() {
  try {
    const packages = getAllPackages();
    const changesetStatus = getChangesetStatus();
    
    displayPublishablePackages(packages, changesetStatus);
    
    const validationPassed = runValidationChecks(packages);
    
    if (!validationPassed) {
      console.error('\n❌ Validation failed. Please fix the errors before publishing.');
      process.exit(1);
    }
    
    const shouldContinue = await askUserConfirmation();
    
    if (!shouldContinue) {
      console.log('\n🛑 Publish cancelled by user.');
      process.exit(1);
    }
    
    console.log('\n✅ Verification completed. Proceeding with publish...');
    
  } catch (error) {
    console.error('Failed to verify publish:', error.message);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみメイン処理を実行
if (require.main === module) {
  main();
}