import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-026',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'No Request Timeout — Zombie Connections Exhausting Thread Pool',
  companies: ['Cloudflare', 'Fastly'],
  timeEst: '~25 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'An HTTP client has no timeout set. Slow upstream services hold connections open for 10+ minutes, exhausting the thread pool under moderate load. Add configurable timeouts.',
  solution: 'Set connectTimeout and readTimeout on the HTTP client. Add a default 5s total timeout. Wrap calls with a circuit-open check so a slow upstream doesn\'t cascade.',
  lang: 'Java',
  tribunalData: {
    background: `The inventory microservice calls a third-party supplier API to check stock. Last Tuesday, the supplier had a partial outage — responses took 8 minutes instead of 200ms.\n\nEvery thread in the Tomcat pool was blocked waiting for a response. New requests queued, then timed out. The inventory service went down even though the supplier API eventually responded.\n\nYour mission: add connection and read timeouts to prevent zombie connections.`,
    folderPath: 'src/main/java/com/inventory/client',
    primaryFile: 'SupplierClient.java',
    files: [
      {
        name: 'SupplierClient.java',
        lang: 'java',
        code: `package com.inventory.client;

import java.net.URL;
import java.net.HttpURLConnection;
import java.io.InputStream;

// TODO: Add connection and read timeouts.
// - connectTimeout: 3000ms
// - readTimeout: 5000ms
// These should be configurable via constructor parameters.
public class SupplierClient {
    private final String baseUrl;

    public SupplierClient(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getStockLevel(String sku) throws Exception {
        URL url = new URL(baseUrl + "/stock/" + sku);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        // BUG: No timeout set — blocks forever on slow responses
        try (InputStream is = conn.getInputStream()) {
            return new String(is.readAllBytes());
        } finally {
            conn.disconnect();
        }
    }
}`,
      },
      {
        name: 'ClientConfig.java',
        lang: 'java',
        code: `package com.inventory.client;

// TODO: Add connectTimeoutMs and readTimeoutMs fields.
// Provide a builder or static factory with sensible defaults.
public class ClientConfig {
    public final int connectTimeoutMs;
    public final int readTimeoutMs;

    // TODO: implement
    private ClientConfig(int connectTimeoutMs, int readTimeoutMs) {
        this.connectTimeoutMs = connectTimeoutMs;
        this.readTimeoutMs = readTimeoutMs;
    }

    public static ClientConfig defaults() {
        return new ClientConfig(3000, 5000);
    }
}`,
      },
    ],
    objectives: [
      {
        label: 'Set connectTimeout on HttpURLConnection',
        check: { type: 'contains', file: 'SupplierClient.java', pattern: 'setConnectTimeout' },
      },
      {
        label: 'Set readTimeout on HttpURLConnection',
        check: { type: 'contains', file: 'SupplierClient.java', pattern: 'setReadTimeout' },
      },
      {
        label: 'Accept ClientConfig in SupplierClient constructor',
        check: { type: 'contains', file: 'SupplierClient.java', pattern: 'ClientConfig' },
      },
    ],
    hints: [
      '`conn.setConnectTimeout(config.connectTimeoutMs)` must be called BEFORE `conn.getInputStream()`.',
      '`conn.setReadTimeout(config.readTimeoutMs)` sets the max time to wait for a read.',
      'Inject `ClientConfig` in the constructor so tests can set tiny timeouts without waiting.',
    ],
    totalTests: 14,
    testFramework: 'JUnit 5 + WireMock',
    xp: 260,
    successMessage: `Zombie connections are dead. The thread pool is protected. A slow supplier now causes a SocketTimeoutException after 5s — not a thread pool exhaustion after 8 minutes. The inventory service stays up.`,
  },
};

export default challenge;
