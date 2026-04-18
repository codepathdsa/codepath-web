import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-025',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Singleton Abuse — Shared State Between Tests',
  companies: ['JetBrains', 'Gradle'],
  timeEst: '~25 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'A ConnectionPool singleton is shared globally. Tests that run in parallel share its state — causing flaky, order-dependent test failures. Refactor to use dependency injection.',
  solution: 'Remove the static getInstance(). Change all consumers to accept a ConnectionPool in their constructor. In tests, inject a fresh instance per test.',
  lang: 'Java',
  tribunalData: {
    background: `The ConnectionPool singleton seemed clever in 2018. Now it causes half the CI failures. Tests run in alphabetical order — if TestA depletes the pool, TestB gets a timeout error that has nothing to do with TestB's logic.\n\nThe root cause: global mutable state. The fix is dependency injection — pass the pool as a constructor argument.\n\nYour mission: eliminate the singleton and make the pool injectable.`,
    folderPath: 'src/main/java/com/app/db',
    primaryFile: 'ConnectionPool.java',
    files: [
      {
        name: 'ConnectionPool.java',
        lang: 'java',
        code: `package com.app.db;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

// TODO: Remove the static singleton.
// Make ConnectionPool a regular class that can be constructed with a size param.
public class ConnectionPool {
    private static ConnectionPool instance;
    private final BlockingQueue<Connection> pool;

    private ConnectionPool() {
        pool = new ArrayBlockingQueue<>(10);
        for (int i = 0; i < 10; i++) {
            pool.add(new Connection());
        }
    }

    // TODO: Delete this
    public static ConnectionPool getInstance() {
        if (instance == null) {
            instance = new ConnectionPool();
        }
        return instance;
    }

    public Connection acquire() throws InterruptedException {
        return pool.take();
    }

    public void release(Connection conn) {
        pool.offer(conn);
    }
}`,
      },
      {
        name: 'UserRepository.java',
        lang: 'java',
        code: `package com.app.db;

// TODO: Accept ConnectionPool via constructor instead of calling getInstance().
public class UserRepository {
    // TODO: add private final ConnectionPool pool; field

    // TODO: change to constructor injection
    public UserRepository() {
        // Remove this — don't call getInstance()
    }

    public User findById(String id) throws Exception {
        Connection conn = ConnectionPool.getInstance().acquire();
        try {
            return conn.query("SELECT * FROM users WHERE id=?", id);
        } finally {
            ConnectionPool.getInstance().release(conn);
        }
    }
}`,
      },
    ],
    objectives: [
      {
        label: 'Remove static getInstance() from ConnectionPool.java',
        check: { type: 'not_contains', file: 'ConnectionPool.java', pattern: 'getInstance' },
      },
      {
        label: 'Add a public constructor that accepts pool size',
        check: { type: 'contains', file: 'ConnectionPool.java', pattern: 'public ConnectionPool(int' },
      },
      {
        label: 'Inject ConnectionPool into UserRepository via constructor',
        check: { type: 'contains', file: 'UserRepository.java', pattern: 'private final ConnectionPool pool' },
      },
      {
        label: 'Remove all getInstance() calls from UserRepository.java',
        check: { type: 'not_contains', file: 'UserRepository.java', pattern: 'getInstance' },
      },
    ],
    hints: [
      'Change `private ConnectionPool()` to `public ConnectionPool(int size)` and replace the hardcoded 10 with `size`.',
      'Add `private final ConnectionPool pool;` to UserRepository and a constructor `UserRepository(ConnectionPool pool) { this.pool = pool; }`',
      'In tests: `ConnectionPool pool = new ConnectionPool(5); UserRepository repo = new UserRepository(pool);` — fresh state per test.',
    ],
    totalTests: 20,
    testFramework: 'JUnit 5',
    xp: 270,
    successMessage: `Tests now run in isolation. Each test creates its own pool — no shared state, no ordering dependencies. CI failures from pool exhaustion are gone. Dependency injection beats global state every time.`,
  },
};

export default challenge;
