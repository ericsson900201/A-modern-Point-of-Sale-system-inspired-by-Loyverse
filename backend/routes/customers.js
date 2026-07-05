import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { runAsync, getAsync, allAsync } from '../database/db.js';

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const customers = await allAsync('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const customer = await getAsync('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create customer
router.post('/', authenticateToken, async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const result = await runAsync(
      'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );
    res.status(201).json({ id: result.id, message: 'Customer created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update customer
router.put('/:id', authenticateToken, async (req, res) => {
  const { name, email, phone, loyalty_points } = req.body;
  try {
    await runAsync(
      'UPDATE customers SET name = ?, email = ?, phone = ?, loyalty_points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, phone, loyalty_points, req.params.id]
    );
    res.json({ message: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
