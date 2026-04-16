import type { Challenge } from '../types';

// ─── ENG-TDT-001 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-TDT-001',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Refactor the God Class (AuthManager)',
  companies: ['Amazon', 'Stripe'],
  timeEst: '~45 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'AuthManager.java is a 4,000-line file with a massive if/else chain for Email, Google, Apple, and SAML. Adding a new provider breaks everything.',
  solution: 'Refactor using the Strategy Design Pattern. Create an IAuthStrategy interface. Extract each provider into its own class. Inject the correct strategy at runtime via a Factory.',
  lang: 'Java',
  tribunalData: {
    background: `Our startup's AuthManager.java started as 200 lines. Three years of "just add an if-statement" later, it's a 600-line God Object that every engineer is afraid to touch.\n\nAdding a new OAuth provider routinely breaks the existing ones because all provider logic is tangled together. The class violates the Open-Closed Principle — it must be modified every time a new requirement arrives.\n\nYour mission: apply the Strategy Design Pattern to extract each auth provider into its own class behind a shared IAuthStrategy interface.`,
    folderPath: 'src/main/java/com/legacy/auth',
    primaryFile: 'AuthManager.java',
    files: [
      {
        name: 'AuthManager.java',
        lang: 'java',
        code: `package com.legacy.auth;

import java.sql.Connection;
import java.sql.ResultSet;

/**
 * TODO: God Object — cyclomatic complexity = 14.
 * Refactor so this class delegates to an IAuthStrategy
 * instead of containing all provider logic itself.
 */
public class AuthManager {

    public boolean authenticate(String username, String password, String providerType) {
        if (providerType.equals("POSTGRES")) {
            Connection conn = PostgresDB.getConnection();
            try {
                ResultSet rs = conn.createStatement().executeQuery(
                    "SELECT * FROM users WHERE username='" + username +
                    "' AND pass='" + password + "'"
                );
                return rs.next();
            } catch (Exception e) {
                return false;
            }
        } else if (providerType.equals("MONGO")) {
            MongoCollection coll = MongoDB.getCollection("users");
            return coll.find("{ user: '" + username + "', pass: '" + password + "'}").hasNext();
        } else if (providerType.equals("GOOGLE")) {
            GoogleToken token = GoogleOAuth.verify(password);
            return token != null && token.getEmail().equals(username);
        } else if (providerType.equals("APPLE")) {
            AppleJWT jwt = AppleAuth.decodeJWT(password);
            return jwt != null && jwt.getClaim("email").equals(username);
        } else if (providerType.equals("SAML")) {
            SAMLAssertion assertion = SAMLParser.parse(password);
            return assertion != null && assertion.getNameID().equals(username);
        } else {
            return false;
        }
    }
}`,
      },
      {
        name: 'IAuthStrategy.java',
        lang: 'java',
        code: `package com.legacy.auth;

/**
 * HINT: Define a common contract for all auth providers.
 * Each provider (Postgres, Google, Apple, SAML, Mongo) should
 * implement this interface in its own dedicated class.
 */
public interface IAuthStrategy {
    boolean authenticate(String username, String credential);
}`,
      },
      {
        name: 'AuthStrategyFactory.java',
        lang: 'java',
        code: `package com.legacy.auth;

/**
 * HINT: Use a Factory to resolve the correct strategy at runtime.
 *
 * AuthManager should become:
 *   return AuthStrategyFactory.getStrategy(providerType)
 *                             .authenticate(username, password);
 */
public class AuthStrategyFactory {

    public static IAuthStrategy getStrategy(String providerType) {
        // TODO: return the correct IAuthStrategy implementation
        // e.g. "GOOGLE" -> new GoogleAuthStrategy()
        throw new IllegalArgumentException("Unknown provider: " + providerType);
    }
}`,
      },
      {
        name: 'UserController.java',
        lang: 'java',
        readOnly: true,
        code: `package com.legacy.auth;

/**
 * READ-ONLY — consumer of AuthManager.
 * Your refactor must NOT change AuthManager's public signature,
 * because this class (and 12 others like it) call it directly.
 */
public class UserController {
    private AuthManager auth = new AuthManager();

    public void handleLoginRequest(Request req, Response res) {
        String type = req.getHeader("Auth-Type");
        boolean isValid = auth.authenticate(req.getUsername(), req.getPassword(), type);

        if (isValid) {
            res.send(200, "OK");
        } else {
            res.send(401, "Unauthorized");
        }
    }
}`,
      },
    ],
    objectives: [
      {
        label: 'Reduce AuthManager cyclomatic complexity (target: ≤ 2 if-statements)',
        check: { type: 'complexity', file: 'AuthManager.java', max: 2 },
      },
      {
        label: 'Declare IAuthStrategy as a variable type in AuthManager (e.g. IAuthStrategy strategy = ...)',
        check: { type: 'contains', file: 'AuthManager.java', pattern: 'IAuthStrategy' },
      },
      {
        label: 'Remove the original if/else provider chain from AuthManager',
        check: { type: 'not_contains', file: 'AuthManager.java', pattern: 'providerType.equals(' },
      },
    ],
    hints: [
      'Create concrete classes like PostgresAuthStrategy.java and GoogleAuthStrategy.java, each implementing IAuthStrategy.',
      'Fill in AuthStrategyFactory.getStrategy() — map each providerType string to a "new XxxAuthStrategy()" instance.',
      'Slim down AuthManager.authenticate() to a single delegation line: return AuthStrategyFactory.getStrategy(providerType).authenticate(username, password);',
    ],
    totalTests: 42,
    testFramework: 'JUnit 5',
    xp: 300,
    successMessage: `You successfully decoupled AuthManager using the Strategy Pattern without breaking any legacy tests. Adding a new auth provider now takes one new class — no modification to AuthManager required. Open-Closed Principle restored.`,
  },
};

export default challenge;

