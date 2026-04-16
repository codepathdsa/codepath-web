import type { Challenge } from '../types';

// ─── ENG-TDT-002 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-TDT-002',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Decouple Tight Database Dependencies',
  companies: ['Shopify', 'Airbnb'],
  timeEst: '~30 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'InvoiceService instantiates a raw MySQL connection inside its methods. Unit tests require a real database container — making CI 10x slower.',
  solution: 'Apply the Repository Pattern + Dependency Injection. Extract an IInvoiceRepository interface. Inject it via the constructor so tests can pass a mock.',
  lang: 'Java',
  tribunalData: {
    background: `InvoiceService.java was written in a weekend sprint. It works fine in production — but nobody can write a unit test for it without spinning up a MySQL container.\n\nThe root problem: the class hard-codes database access inside its business logic. It violates the Dependency Inversion Principle — high-level policy (billing logic) depends on a low-level detail (MySQL).\n\nYour mission: introduce an IInvoiceRepository interface and inject it via the constructor. The service should never instantiate a database connection itself.`,
    folderPath: 'src/main/java/com/billing',
    primaryFile: 'InvoiceService.java',
    files: [
      {
        name: 'InvoiceService.java',
        lang: 'java',
        code: `package com.billing;

import java.sql.Connection;
import java.sql.ResultSet;

/**
 * TODO: Violates Dependency Inversion Principle.
 * Hard-codes MySQL access inside business logic.
 * Inject IInvoiceRepository via the constructor instead.
 */
public class InvoiceService {

    public Invoice getInvoice(String invoiceId) {
        Connection conn = MySQLConnection.getConnection();
        try {
            ResultSet rs = conn.createStatement().executeQuery(
                "SELECT * FROM invoices WHERE id = '" + invoiceId + "'"
            );
            if (rs.next()) {
                return new Invoice(rs.getString("id"), rs.getDouble("amount"));
            }
        } catch (Exception e) {
            throw new RuntimeException("DB error", e);
        }
        return null;
    }

    public void markPaid(String invoiceId) {
        Connection conn = MySQLConnection.getConnection();
        try {
            conn.createStatement().executeUpdate(
                "UPDATE invoices SET status='PAID' WHERE id = '" + invoiceId + "'"
            );
        } catch (Exception e) {
            throw new RuntimeException("DB error", e);
        }
    }
}`,
      },
      {
        name: 'IInvoiceRepository.java',
        lang: 'java',
        code: `package com.billing;

/**
 * HINT: Define a data-access contract here.
 * InvoiceService should depend on THIS interface,
 * not on a concrete MySQL connection.
 */
public interface IInvoiceRepository {
    Invoice findById(String invoiceId);
    void updateStatus(String invoiceId, String status);
}`,
      },
      {
        name: 'MySQLInvoiceRepository.java',
        lang: 'java',
        code: `package com.billing;

import java.sql.Connection;
import java.sql.ResultSet;

/**
 * HINT: The real MySQL implementation lives here.
 * InvoiceService should NOT know MySQL exists.
 */
public class MySQLInvoiceRepository implements IInvoiceRepository {

    @Override
    public Invoice findById(String invoiceId) {
        Connection conn = MySQLConnection.getConnection();
        try {
            ResultSet rs = conn.createStatement().executeQuery(
                "SELECT * FROM invoices WHERE id = '" + invoiceId + "'"
            );
            if (rs.next()) {
                return new Invoice(rs.getString("id"), rs.getDouble("amount"));
            }
        } catch (Exception e) {
            throw new RuntimeException("DB error", e);
        }
        return null;
    }

    @Override
    public void updateStatus(String invoiceId, String status) {
        Connection conn = MySQLConnection.getConnection();
        try {
            conn.createStatement().executeUpdate(
                "UPDATE invoices SET status='" + status + "' WHERE id = '" + invoiceId + "'"
            );
        } catch (Exception e) {
            throw new RuntimeException("DB error", e);
        }
    }
}`,
      },
      {
        name: 'InvoiceServiceTest.java',
        lang: 'java',
        readOnly: true,
        code: `package com.billing;

import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * READ-ONLY — shows what you are unlocking.
 * This test runs without any database once you
 * inject IInvoiceRepository via the constructor.
 */
public class InvoiceServiceTest {

    @Test
    void getInvoice_returnsMockedInvoice() {
        IInvoiceRepository mockRepo = mock(IInvoiceRepository.class);
        when(mockRepo.findById("INV-001"))
            .thenReturn(new Invoice("INV-001", 299.99));

        InvoiceService service = new InvoiceService(mockRepo);
        Invoice result = service.getInvoice("INV-001");

        assertEquals("INV-001", result.getId());
        assertEquals(299.99, result.getAmount());
        verify(mockRepo, times(1)).findById("INV-001");
    }
}`,
      },
    ],
    objectives: [
      {
        label: 'Declare IInvoiceRepository field in InvoiceService (e.g. IInvoiceRepository repository = ...)',
        check: { type: 'contains', file: 'InvoiceService.java', pattern: 'IInvoiceRepository' },
      },
      {
        label: 'Remove direct MySQLConnection.getConnection() from InvoiceService',
        check: { type: 'not_contains', file: 'InvoiceService.java', pattern: 'MySQLConnection.getConnection()' },
      },
      {
        label: 'Delegate data access via repository.findById(...)',
        check: { type: 'contains', file: 'InvoiceService.java', pattern: 'repository.find' },
      },
    ],
    hints: [
      'Add a constructor: `public InvoiceService(IInvoiceRepository repository) { this.repository = repository; }`',
      'Replace the MySQL block in getInvoice() with: `return this.repository.findById(invoiceId);`',
      'Replace the MySQL block in markPaid() with: `this.repository.updateStatus(invoiceId, "PAID");`',
    ],
    totalTests: 28,
    testFramework: 'JUnit 5 + Mockito',
    xp: 250,
    successMessage: 'InvoiceService no longer knows MySQL exists. Any module can inject a mock repository in tests — CI pipeline dropped from 4 minutes to 18 seconds. Dependency Inversion Principle restored.',
  },
};

export default challenge;
