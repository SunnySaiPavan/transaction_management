const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database setup
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) console.error('Database Error:', err.message);
    console.log('Connected to the SQLite database.');
});

// Create Transaction Table
db.serialize(() => {
    db.run(`
        CREATE TABLE transactions (
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            transaction_type TEXT CHECK(transaction_type IN ('DEPOSIT', 'WITHDRAWAL')) NOT NULL,
            user_id INTEGER NOT NULL,
            status TEXT CHECK(status IN ('PENDING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

// POST /api/transactions/ - Create Transaction
app.post('/api/transactions', (req, res) => {
    const { amount, transaction_type, user } = req.body;

    if (!amount || !transaction_type || !user) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    const sql = `INSERT INTO transactions (amount, transaction_type, user_id) VALUES (?, ?, ?)`;
    db.run(sql, [amount, transaction_type, user], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            transaction_id: this.lastID,
            amount,
            transaction_type,
            status: 'PENDING',
            user,
            timestamp: new Date().toISOString(),
        });
    });
});

// GET /api/transactions/ - Retrieve Transactions by User
app.get('/api/transactions', (req, res) => {
    const { user_id } = req.query;

    if (!user_id) return res.status(400).json({ error: 'User ID is required' });

    const sql = `SELECT * FROM transactions WHERE user_id = ?`;
    db.all(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ transactions: rows });
    });
});

// GET /api/transactions/:id - Retrieve Transaction by ID
app.get('/api/transactions/:id', (req, res) => {
    const { id } = req.params;

    const sql = `SELECT * FROM transactions WHERE transaction_id = ?`;
    db.get(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Transaction not found' });
        res.json(row);
    });
});

// PUT /api/transactions/:id - Update Transaction Status
app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['COMPLETED', 'FAILED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    const sql = `UPDATE transactions SET status = ? WHERE transaction_id = ?`;
    db.run(sql, [status, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });

        const sql = `SELECT * FROM transactions WHERE transaction_id = ?`;
        db.get(sql, [id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(row);
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
