#!/usr/bin/env node
/**
 * Domain Setup Verification Script
 * 
 * Verifies that a custom domain is properly configured for Shuttle deployment.
 * Checks DNS resolution, CNAME records, HTTP/HTTPS access, and SSL certificate.
 * 
 * Usage:
 *   npm run build:scripts
 *   node scripts/dist/verify-domain-setup.js <domain> <shuttle-url>
 * 
 * Example:
 *   node scripts/dist/verify-domain-setup.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app
 */

import { spawnSync } from 'child_process';
import * as process from 'process';

interface VerificationResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

function checkDNSCNAME(domain: string): { found: boolean; value?: string } {
  try {
    // Validate domain contains only safe characters (alphanumeric, dots, hyphens)
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      return { found: false };
    }
    // Use spawnSync with array arguments to prevent command injection
    const result = spawnSync('dig', ['CNAME', '+short', domain], { encoding: 'utf-8' });
    if (result.error || result.status !== 0) {
      return { found: false };
    }
    const output = result.stdout?.toString() || '';
    const trimmed = output.trim();
    
    if (trimmed) {
      return {
        found: true,
        value: trimmed.replace(/\.$/, ''),
      };
    }
    
    return { found: false };
  } catch {
    return { found: false };
  }
}

function checkDNSResolution(domain: string): { resolved: boolean; ips?: string[] } {
  try {
    // Validate domain contains only safe characters (alphanumeric, dots, hyphens)
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      return { resolved: false };
    }
    // Use spawnSync with array arguments to prevent command injection
    const result = spawnSync('dig', ['+short', domain], { encoding: 'utf-8' });
    if (result.error || result.status !== 0) {
      return { resolved: false };
    }
    const output = result.stdout?.toString() || '';
    const ips = output.trim().split('\n').filter(line => line && !line.includes('CNAME'));
    
    if (ips.length > 0) {
      return {
        resolved: true,
        ips: ips,
      };
    }
    
    return { resolved: false };
  } catch {
    return { resolved: false };
  }
}

function checkHTTPAccess(domain: string): { accessible: boolean; statusCode?: number } {
  try {
    // Validate domain contains only safe characters (alphanumeric, dots, hyphens)
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      return { accessible: false };
    }
    // Use spawnSync with array arguments to prevent command injection
    // Use -w with newline to put status code on its own line for easier extraction
    const result = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '\n%{http_code}', '-I', `http://${domain}`], { encoding: 'utf-8' });
    if (result.error || result.status !== 0) {
      return { accessible: false };
    }
    const output = result.stdout?.toString() || '';
    // Extract status code from last line (after headers)
    const lines = output.trim().split('\n');
    const statusCodeStr = lines[lines.length - 1] || '';
    const statusCode = parseInt(statusCodeStr, 10);
    
    // Check if we got a valid status code
    if (isNaN(statusCode)) {
      return { accessible: false };
    }
    
    return {
      accessible: statusCode >= 200 && statusCode < 400,
      statusCode,
    };
  } catch {
    return { accessible: false };
  }
}

function checkHTTPSAccess(domain: string): { accessible: boolean; statusCode?: number } {
  try {
    // Validate domain contains only safe characters (alphanumeric, dots, hyphens)
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      return { accessible: false };
    }
    // Use spawnSync with array arguments to prevent command injection
    // Use -w with newline to put status code on its own line for easier extraction
    const result = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '\n%{http_code}', '-I', `https://${domain}`], { encoding: 'utf-8' });
    if (result.error || result.status !== 0) {
      return { accessible: false };
    }
    const output = result.stdout?.toString() || '';
    // Extract status code from last line (after headers)
    const lines = output.trim().split('\n');
    const statusCodeStr = lines[lines.length - 1] || '';
    const statusCode = parseInt(statusCodeStr, 10);
    
    // Check if we got a valid status code
    if (isNaN(statusCode)) {
      return { accessible: false };
    }
    
    return {
      accessible: statusCode >= 200 && statusCode < 400,
      statusCode,
    };
  } catch {
    return { accessible: false };
  }
}

function checkSSLCertificate(domain: string): { valid: boolean; expirationDate?: string } {
  try {
    // Validate domain contains only safe characters (alphanumeric, dots, hyphens)
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) {
      return { valid: false };
    }
    // Chain commands without shell to prevent injection
    // First: Get SSL certificate info using openssl s_client
    // Send newline to stdin to make openssl exit after getting certificate
    const sslClientResult = spawnSync(
      'openssl',
      ['s_client', '-servername', domain, '-connect', `${domain}:443`],
      { 
        encoding: 'utf-8',
        input: '\n', // Send newline to make openssl exit (equivalent to 'echo |')
        stdio: ['pipe', 'pipe', 'pipe'] // stdin, stdout, stderr
      }
    );
    
    // openssl s_client may return non-zero status but still provide certificate data
    // Check for error first, then check if we got certificate data
    if (sslClientResult.error) {
      return { valid: false };
    }
    
    // Extract certificate data from output (between BEGIN and END markers)
    const output = sslClientResult.stdout?.toString() || '';
    const certMatch = output.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);
    if (!certMatch) {
      return { valid: false };
    }
    
    const certData = certMatch[0];
    
    // Second: Extract certificate dates from the certificate data
    const x509Result = spawnSync(
      'openssl',
      ['x509', '-noout', '-dates'],
      {
        encoding: 'utf-8',
        input: certData,
        stdio: ['pipe', 'pipe', 'pipe']
      }
    );
    
    if (x509Result.error || x509Result.status !== 0) {
      return { valid: false };
    }
    
    const datesOutput = x509Result.stdout?.toString() || '';
    const match = datesOutput.match(/notAfter=(.+)/);
    if (match && match[1]) {
      return {
        valid: true,
        expirationDate: match[1],
      };
    }
    
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

function verifyDomainSetup(domain: string, expectedShuttleUrl: string): VerificationResult[] {
  const results: VerificationResult[] = [];

  // 1. Check DNS Resolution
  console.log('1. Checking DNS resolution...');
  const dnsResolution = checkDNSResolution(domain);
  if (dnsResolution.resolved) {
    results.push({
      check: 'DNS Resolution',
      status: 'pass',
      message: `Domain resolves to: ${dnsResolution.ips?.join(', ')}`,
    });
  } else {
    results.push({
      check: 'DNS Resolution',
      status: 'fail',
      message: 'Domain does not resolve to any IP addresses',
    });
  }

  // 2. Check CNAME Record
  console.log('2. Checking CNAME record...');
  const cnameCheck = checkDNSCNAME(domain);
  if (cnameCheck.found) {
    if (cnameCheck.value === expectedShuttleUrl) {
      results.push({
        check: 'CNAME Record',
        status: 'pass',
        message: `CNAME correctly points to: ${cnameCheck.value}`,
      });
    } else {
      results.push({
        check: 'CNAME Record',
        status: 'warning',
        message: `CNAME found but points to: ${cnameCheck.value} (expected: ${expectedShuttleUrl})`,
      });
    }
  } else {
    results.push({
      check: 'CNAME Record',
      status: 'fail',
      message: 'CNAME record not found',
    });
  }

  // 3. Check HTTP Access
  console.log('3. Checking HTTP access...');
  const httpCheck = checkHTTPAccess(domain);
  if (httpCheck.accessible) {
    results.push({
      check: 'HTTP Access',
      status: 'pass',
      message: `HTTP accessible (status: ${httpCheck.statusCode})`,
    });
  } else {
    results.push({
      check: 'HTTP Access',
      status: 'fail',
      message: 'HTTP not accessible',
    });
  }

  // 4. Check HTTPS Access
  console.log('4. Checking HTTPS access...');
  const httpsCheck = checkHTTPSAccess(domain);
  if (httpsCheck.accessible) {
    results.push({
      check: 'HTTPS Access',
      status: 'pass',
      message: `HTTPS accessible (status: ${httpsCheck.statusCode})`,
    });
  } else {
    results.push({
      check: 'HTTPS Access',
      status: 'fail',
      message: 'HTTPS not accessible - SSL certificate may not be configured',
    });
  }

  // 5. Check SSL Certificate
  console.log('5. Checking SSL certificate...');
  const sslCheck = checkSSLCertificate(domain);
  if (sslCheck.valid) {
    const expirationMsg = sslCheck.expirationDate 
      ? ` (expires: ${sslCheck.expirationDate})`
      : '';
    results.push({
      check: 'SSL Certificate',
      status: 'pass',
      message: `SSL certificate valid${expirationMsg}`,
    });
  } else {
    results.push({
      check: 'SSL Certificate',
      status: 'fail',
      message: 'SSL certificate not found or invalid',
    });
  }

  return results;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node verify-domain-setup.js <domain> <shuttle-url>');
    console.error('Example: node verify-domain-setup.js tensor-logic.samkirk.com tensor-logic-noo5.shuttle.app');
    process.exit(1);
  }

  const [domain, shuttleUrl] = args;
  
  if (!domain || !shuttleUrl) {
    console.error('Error: Both domain and shuttle-url are required');
    process.exit(1);
  }
  
  console.log(`🔍 Verifying domain setup for: ${domain}`);
  console.log(`   Expected Shuttle URL: ${shuttleUrl}`);
  console.log('');

  const results = verifyDomainSetup(domain, shuttleUrl);

  console.log('\n📊 Verification Results:');
  console.log('─'.repeat(60));

  let allPassed = true;
  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.check}: ${result.message}`);
    // Only treat 'fail' status as failure, not 'warning'
    if (result.status === 'fail') {
      allPassed = false;
    }
  }

  console.log('─'.repeat(60));

  if (allPassed) {
    console.log('\n✅ All checks passed! Domain is properly configured.');
    process.exit(0);
  } else {
    console.log('\n❌ Some checks failed. Please review the results above.');
    process.exit(1);
  }
}

// ES module entry point - call main() directly since this script is meant to be executed
main();

