const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build folder
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Database setup
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'corebank.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Customers table
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Accounts table
    db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        account_type TEXT NOT NULL,
        balance REAL DEFAULT 0,
        interest_rate REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);

    // Transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `);

    // Interest history table
    db.run(`
      CREATE TABLE IF NOT EXISTS interest_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        interest_earned REAL NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `);
  });
}

// ===== CUSTOMER ENDPOINTS =====

// Get all customers
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single customer with accounts
app.get('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM customers WHERE id = ?', [id], (err, customer) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    // Get accounts for this customer
    db.all('SELECT * FROM accounts WHERE customer_id = ?', [id], (err, accounts) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ ...customer, accounts: accounts || [] });
    });
  });
});

// Create customer
app.post('/api/customers', (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email required' });
    return;
  }

  db.run(
    'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
    [name, email, phone || ''],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          res.status(400).json({ error: 'Email already exists' });
        } else {
          res.status(500).json({ error: err.message });
        }
        return;
      }
      res.status(201).json({ id: this.lastID, name, email, phone });
    }
  );
});

// ===== ACCOUNT ENDPOINTS =====

// Get all accounts
app.get('/api/accounts', (req, res) => {
  db.all(
    `SELECT a.*, c.name as customer_name FROM accounts a 
     LEFT JOIN customers c ON a.customer_id = c.id 
     ORDER BY a.created_at DESC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Get single account with transactions
app.get('/api/accounts/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM accounts WHERE id = ?', [id], (err, account) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    // Get transactions for this account
    db.all(
      'SELECT * FROM transactions WHERE account_id = ? ORDER BY timestamp DESC',
      [id],
      (err, transactions) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ ...account, transactions: transactions || [] });
      }
    );
  });
});

// Create account
app.post('/api/accounts', (req, res) => {
  const { customer_id, account_type, interest_rate } = req.body;

  if (!customer_id || !account_type) {
    res.status(400).json({ error: 'customer_id and account_type required' });
    return;
  }

  db.run(
    'INSERT INTO accounts (customer_id, account_type, interest_rate) VALUES (?, ?, ?)',
    [customer_id, account_type, interest_rate || 0],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({
        id: this.lastID,
        customer_id,
        account_type,
        balance: 0,
        interest_rate: interest_rate || 0
      });
    }
  );
});

// ===== TRANSACTION ENDPOINTS =====

// Deposit
app.post('/api/transactions/deposit', (req, res) => {
  const { account_id, amount, description } = req.body;

  if (!account_id || !amount || amount <= 0) {
    res.status(400).json({ error: 'Valid account_id and amount required' });
    return;
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Insert transaction
    db.run(
      'INSERT INTO transactions (account_id, type, amount, description) VALUES (?, ?, ?, ?)',
      [account_id, 'deposit', amount, description || 'Deposit'],
      function (err) {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }

        // Update account balance
        db.run(
          'UPDATE accounts SET balance = balance + ? WHERE id = ?',
          [amount, account_id],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              res.status(500).json({ error: err.message });
              return;
            }

            db.get('SELECT * FROM accounts WHERE id = ?', [account_id], (err, account) => {
              if (err) {
                db.run('ROLLBACK');
                res.status(500).json({ error: err.message });
                return;
              }

              db.run('COMMIT');
              res.status(201).json({
                transaction_id: this.lastID,
                account_id,
                type: 'deposit',
                amount,
                new_balance: account.balance
              });
            });
          }
        );
      }
    );
  });
});

// Withdraw
app.post('/api/transactions/withdraw', (req, res) => {
  const { account_id, amount, description } = req.body;

  if (!account_id || !amount || amount <= 0) {
    res.status(400).json({ error: 'Valid account_id and amount required' });
    return;
  }

  db.serialize(() => {
    // Check balance first
    db.get('SELECT balance FROM accounts WHERE id = ?', [account_id], (err, account) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!account) {
        res.status(404).json({ error: 'Account not found' });
        return;
      }
      if (account.balance < amount) {
        res.status(400).json({ error: 'Insufficient funds' });
        return;
      }

      db.run('BEGIN TRANSACTION');

      // Insert transaction
      db.run(
        'INSERT INTO transactions (account_id, type, amount, description) VALUES (?, ?, ?, ?)',
        [account_id, 'withdraw', amount, description || 'Withdrawal'],
        function (err) {
          if (err) {
            db.run('ROLLBACK');
            res.status(500).json({ error: err.message });
            return;
          }

          // Update account balance
          db.run(
            'UPDATE accounts SET balance = balance - ? WHERE id = ?',
            [amount, account_id],
            (err) => {
              if (err) {
                db.run('ROLLBACK');
                res.status(500).json({ error: err.message });
                return;
              }

              db.get('SELECT balance FROM accounts WHERE id = ?', [account_id], (err, updated) => {
                if (err) {
                  db.run('ROLLBACK');
                  res.status(500).json({ error: err.message });
                  return;
                }

                db.run('COMMIT');
                res.status(201).json({
                  transaction_id: this.lastID,
                  account_id,
                  type: 'withdraw',
                  amount,
                  new_balance: updated.balance
                });
              });
            }
          );
        }
      );
    });
  });
});

// Transfer between accounts
app.post('/api/transactions/transfer', (req, res) => {
  const { from_account_id, to_account_id, amount, description } = req.body;

  if (!from_account_id || !to_account_id || !amount || amount <= 0) {
    res.status(400).json({ error: 'Valid account IDs and amount required' });
    return;
  }

  if (from_account_id === to_account_id) {
    res.status(400).json({ error: 'Cannot transfer to same account' });
    return;
  }

  db.serialize(() => {
    // Check source balance
    db.get('SELECT balance FROM accounts WHERE id = ?', [from_account_id], (err, account) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!account) {
        res.status(404).json({ error: 'Source account not found' });
        return;
      }
      if (account.balance < amount) {
        res.status(400).json({ error: 'Insufficient funds' });
        return;
      }

      db.run('BEGIN TRANSACTION');

      // Insert outgoing transaction
      db.run(
        'INSERT INTO transactions (account_id, type, amount, description) VALUES (?, ?, ?, ?)',
        [from_account_id, 'transfer_out', amount, description || 'Transfer'],
        (err) => {
          if (err) {
            db.run('ROLLBACK');
            res.status(500).json({ error: err.message });
            return;
          }

          // Insert incoming transaction
          db.run(
            'INSERT INTO transactions (account_id, type, amount, description) VALUES (?, ?, ?, ?)',
            [to_account_id, 'transfer_in', amount, description || 'Transfer'],
            (err) => {
              if (err) {
                db.run('ROLLBACK');
                res.status(500).json({ error: err.message });
                return;
              }

              // Update balances
              db.run(
                'UPDATE accounts SET balance = balance - ? WHERE id = ?',
                [amount, from_account_id],
                (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    res.status(500).json({ error: err.message });
                    return;
                  }

                  db.run(
                    'UPDATE accounts SET balance = balance + ? WHERE id = ?',
                    [amount, to_account_id],
                    (err) => {
                      if (err) {
                        db.run('ROLLBACK');
                        res.status(500).json({ error: err.message });
                        return;
                      }

                      db.run('COMMIT');
                      res.status(201).json({
                        success: true,
                        from_account_id,
                        to_account_id,
                        amount,
                        description
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
});

// ===== INTEREST ENDPOINTS =====

// Apply interest to an account
app.post('/api/interest/apply', (req, res) => {
  const { account_id } = req.body;

  if (!account_id) {
    res.status(400).json({ error: 'account_id required' });
    return;
  }

  db.get('SELECT balance, interest_rate FROM accounts WHERE id = ?', [account_id], (err, account) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    const interestEarned = account.balance * (account.interest_rate / 100);

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      db.run(
        'UPDATE accounts SET balance = balance + ? WHERE id = ?',
        [interestEarned, account_id],
        (err) => {
          if (err) {
            db.run('ROLLBACK');
            res.status(500).json({ error: err.message });
            return;
          }

          db.run(
            'INSERT INTO interest_history (account_id, interest_earned) VALUES (?, ?)',
            [account_id, interestEarned],
            (err) => {
              if (err) {
                db.run('ROLLBACK');
                res.status(500).json({ error: err.message });
                return;
              }

              db.run('COMMIT');
              res.json({
                account_id,
                interest_earned: interestEarned,
                new_balance: account.balance + interestEarned
              });
            }
          );
        }
      );
    });
  });
});

// Get interest history
app.get('/api/interest-history/:account_id', (req, res) => {
  const { account_id } = req.params;
  db.all(
    'SELECT * FROM interest_history WHERE account_id = ? ORDER BY applied_at DESC',
    [account_id],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Serve React app for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`CoreBank running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});
