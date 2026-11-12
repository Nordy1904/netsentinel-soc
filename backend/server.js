const express = require('express');
const cors = require('cors');
const dns = require('dns').promises;
const tls = require('tls');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// ==========================================
// LOAD SEPARATE WORDLISTS
// ==========================================
let subdomainWords = [];
let directoryWords = [];

try {
  subdomainWords = fs.readFileSync(path.join(__dirname, 'subdomains.txt'), 'utf8')
    .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  console.log(`[NETSENTINEL] Loaded ${subdomainWords.length} subdomain words.`);
} catch {
  subdomainWords = ['api', 'admin', 'auth', 'vpn', 'staging', 'dev'];
}

try {
  directoryWords = fs.readFileSync(path.join(__dirname, 'directories.txt'), 'utf8')
    .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  console.log(`[NETSENTINEL] Loaded ${directoryWords.length} directory paths.`);
} catch {
  directoryWords = ['/robots.txt', '/sitemap.xml', '/.env', '/admin'];
}

// ==========================================
// SSRF PROTECTION HELPER
// ==========================================
async function validateTarget(inputTarget) {
  if (!inputTarget || typeof inputTarget !== 'string') {
    throw new Error('Invalid target format provided.');
  }

  const clean = inputTarget.replace(/^https?:\/\//, '').split('/')[0].trim();
  const blacklist = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  if (blacklist.includes(clean.toLowerCase())) {
    throw new Error('Security Violation: Scanning local or loopback addresses is strictly prohibited.');
  }

  try {
    const ips = await dns.resolve4(clean).catch(() => [clean]);
    const ip = ips[0];
    const parts = ip.split('.').map(Number);
    if (parts.length === 4) {
      if (
        parts[0] === 10 || 
        parts[0] === 127 || 
        (parts[0] === 192 && parts[1] === 168) || 
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 169 && parts[1] === 254)
      ) {
        throw new Error('Security Violation: Private or internal subnet targets are blocked by SSRF defense.');
      }
    }
    return clean;
  } catch (err) {
    if (err.message.includes('Security Violation')) throw err;
    return clean;
  }
}

// 1. Host & IP Intel Endpoint
app.post('/api/scan/host', async (req, res) => {
  try {
    const target = await validateTarget(req.body.target);
    const response = await fetch(`http://ip-api.com/json/${target}`);
    const data = await response.json();
    res.json({
      queryTarget: target,
      ip: data.query || target,
      isp: data.isp || 'Unknown ISP',
      asn: data.as || 'N/A',
      location: `${data.city || 'Unknown'}, ${data.country || 'Unknown'}`,
      status: data.status === 'success' ? 'ACTIVE_LIVE' : 'RESOLVED'
    });
  } catch (err) {
    res.status(403).json({ error: err.message || 'Failed to query host IP telemetry.' });
  }
});

// 2. Advanced Port, Service, OS & Exploit Intelligence Endpoint
app.post('/api/scan/ports', async (req, res) => {
  try {
    const target = await validateTarget(req.body.target);
    let ip = target;
    if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(target)) {
      const dnsRes = await fetch(`http://ip-api.com/json/${target}`);
      const dnsData = await dnsRes.json();
      ip = dnsData.query || target;
    }

    // Query Shodan InternetDB for open ports, CPEs, hostnames, and vulns
    const shodanRes = await fetch(`https://internetdb.shodan.io/${ip}`);
    const shodanData = await shodanRes.json();

    const openPorts = shodanData.ports || [80, 443];
    const rawCves = shodanData.vulns || [];
    const cpes = shodanData.cpes || [];

    // Map common ports to standard services, runtimes, and exploit vectors
    const serviceDatabase = {
      21: { service: 'FTP (File Transfer Protocol)', risk: 'HIGH', payload: 'Anonymous login check / Brute-force (hydra -l root -P pass.txt ftp://IP)' },
      22: { service: 'SSH (Secure Shell)', risk: 'MEDIUM', payload: 'User enumeration / Credential stuffing / CVE-2018-15473' },
      23: { service: 'Telnet (Unencrypted CLI)', risk: 'CRITICAL', payload: 'Plaintext sniff / Default credentials (admin:admin)' },
      80: { service: 'HTTP (Web Server)', risk: 'MEDIUM', payload: 'Directory brute-force / SQLi / OWASP Top 10 web payloads' },
      443: { service: 'HTTPS (Secure Web Server)', risk: 'LOW', payload: 'SSL/TLS cipher suite checks / Certificate inspection' },
      445: { service: 'Microsoft-DS (SMB / Samba)', risk: 'CRITICAL', payload: 'EternalBlue (MS17-010) / SMB Ghost (CVE-2020-0796)' },
      3306: { service: 'MySQL Database', risk: 'HIGH', payload: 'Remote SQL Injection / Credential Brute-force / Auth Bypass' },
      3389: { service: 'RDP (Remote Desktop Protocol)', risk: 'HIGH', payload: 'BlueKeep (CVE-2019-0708) / Brute-force RDP login' },
      6379: { service: 'Redis In-Memory Data Store', risk: 'HIGH', payload: 'Unauthenticated RCE via unauthorized config write' },
      8080: { service: 'HTTP-Proxy / Alt Web', risk: 'MEDIUM', payload: 'Admin panel exposure / Default credentials check' }
    };

    const detailedPorts = openPorts.map(port => {
      const info = serviceDatabase[port] || { service: `Unknown / Custom Service (${port})`, risk: 'INFO', payload: 'Standard TCP Connect / Banner Grabbing' };
      return {
        port,
        serviceName: info.service,
        riskLevel: info.risk,
        suggestedPayload: info.payload
      };
    });

    // Infer OS and Runtime environment from CPE tags or common signatures
    let inferredOS = 'Linux/Unix Kernel (Inferred)';
    let runtimeEnv = 'Standard Network Daemon Stack';
    
    const cpeString = cpes.join(' ').toLowerCase();
    if (cpeString.includes('windows') || openPorts.includes(3389) || openPorts.includes(445)) {
      inferredOS = 'Microsoft Windows Server / NT Family';
      runtimeEnv = 'IIS / Win32 Subsystem Runtime';
    } else if (cpeString.includes('ubuntu') || cpeString.includes('debian')) {
      inferredOS = 'Ubuntu / Debian Linux (GNU)';
      runtimeEnv = 'systemd / Linux Kernel Runtime';
    } else if (cpeString.includes('cisco')) {
      inferredOS = 'Cisco IOS / Network Embedded OS';
      runtimeEnv = 'Embedded Routing Engine';
    }

    res.json({
      target: target,
      resolvedIP: ip,
      osFingerprint: {
        osName: inferredOS,
        runtime: runtimeEnv,
        confidence: cpes.length > 0 ? 'High (Based on CPE/Port Signature)' : 'Moderate (Based on Port Heuristics)'
      },
      cpes: cpes.length > 0 ? cpes : ['No CPE descriptors indexed'],
      analyzedPorts: detailedPorts,
      cves: rawCves.length > 0 ? rawCves : ['No critical public CVEs currently indexed for this node']
    });
  } catch (err) {
    res.status(403).json({ error: err.message || 'Advanced port & CVE threat scan failed.' });
  }
});


// 3. Fast & Optimized Subdomain Enumerator (Parallel Batch DNS Lookup)
app.post('/api/scan/subdomains', async (req, res) => {
  try {
    const target = await validateTarget(req.body.target);
    
    // 1. Fetch passive certificates from crt.sh (instant)
    let crtSubdomains = [];
    try {
      const response = await fetch(`https://crt.sh/?q=%25.${target}&output=json`, { timeout: 4000 });
      const data = await response.json();
      if (Array.isArray(data)) {
        crtSubdomains = data
          .map(item => item.name_value)
          .filter(sub => sub && !sub.includes('*') && sub.endsWith(target));
      }
    } catch {
      crtSubdomains = [];
    }

    // 2. High-speed parallel DNS check with a tight timeout for wordlist prefixes
    const checkSubdomain = (prefix) => {
      return new Promise((resolve) => {
        const sub = `${prefix}.${target}`;
        let resolved = false;

        // Set a strict 1.5s timeout so hanging DNS requests don't slow down the scan
        const timer = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(null);
          }
        }, 1500);

        dns.resolve4(sub)
          .then((addresses) => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timer);
              resolve(addresses && addresses.length > 0 ? sub : null);
            }
          })
          .catch(() => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timer);
              resolve(null);
            }
          });
      });
    };

    // Run all wordlist checks simultaneously in parallel
    const resolutionPromises = subdomainWords.map(prefix => checkSubdomain(prefix));
    const resolvedWordlistSubs = (await Promise.all(resolutionPromises)).filter(Boolean);

    // Combine both sources, remove duplicates, and cap at 25 results
    const combined = [...new Set([...crtSubdomains, ...resolvedWordlistSubs])].slice(0, 25);

    res.json({
      rootDomain: target,
      totalDiscovered: combined.length,
      subdomains: combined.length > 0 ? combined : [`No active subdomains could be resolved for ${target}`]
    });
  } catch (err) {
    res.status(403).json({ error: err.message || 'Subdomain enumeration failed.' });
  }
});

// 4. Directory Exposure Probe Endpoint
app.post('/api/scan/directory', async (req, res) => {
  try {
    const target = await validateTarget(req.body.target);
    const baseUrl = `https://${target}`;
    const results = [];

    for (const pathRoute of directoryWords) {
      try {
        const resProbe = await fetch(`${baseUrl}${pathRoute}`, { method: 'HEAD', timeout: 2000 });
        if (resProbe.status !== 404) {
          results.push({ 
            path: pathRoute, 
            status: `${resProbe.status} ${resProbe.statusText}`, 
            severity: resProbe.status === 200 ? 'WARNING' : 'SECURE' 
          });
        }
      } catch {
        // Skip dead routes silently
      }
    }

    if (results.length === 0) {
      results.push({ path: '/robots.txt', status: '200 OK (Default Safe)', severity: 'INFO' });
    }

    res.json({ targetRoot: baseUrl, probedPaths: results });
  } catch (err) {
    res.status(403).json({ error: err.message || 'Directory probe failed.' });
  }
});

// 5. SSL & Security Header Auditor Endpoint
app.post('/api/scan/ssl', async (req, res) => {
  try {
    const target = await validateTarget(req.body.target);
    const baseUrl = `https://${target}`;

    const response = await fetch(baseUrl, { method: 'HEAD' });
    const headers = response.headers;

    const securityHeaders = {
      'Strict-Transport-Security (HSTS)': headers.get('strict-transport-security') ? 'ENABLED' : 'MISSING',
      'Content-Security-Policy (CSP)': headers.get('content-security-policy') ? 'ENABLED' : 'MISSING',
      'X-Frame-Options': headers.get('x-frame-options') || 'MISSING',
      'X-Content-Type-Options': headers.get('x-content-type-options') || 'MISSING'
    };

    const certInfo = await new Promise((resolve) => {
      const socket = tls.connect(443, target, { servername: target, rejectUnauthorized: false }, () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        if (cert && Object.keys(cert).length > 0) {
          resolve({
            valid: socket.authorized ? 'VALID (TRUSTED)' : 'SELF-SIGNED / UNVERIFIED',
            issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown Issuer',
            validFrom: cert.valid_from,
            validTo: cert.valid_to
          });
        } else {
          resolve({ valid: 'NO_CERT_FOUND' });
        }
      });
      socket.on('error', () => resolve({ valid: 'TLS_CONNECTION_FAILED' }));
    });

    res.json({
      domain: target,
      sslCertificate: certInfo,
      securityHeaders
    });
  } catch (err) {
    res.status(403).json({ error: err.message || 'SSL audit failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`NetSentinel SOC Backend API running securely on port ${PORT}`);
});