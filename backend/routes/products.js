import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { runAsync, getAsync, allAsync } from '../database/db.js';

const router = express.Router();

// Get all products
router.get('/', authenticateToken, async (req, res) => {
  try {
    const products = await allAsync('SELECT * FROM products WHERE active = 1');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const product = await getAsync('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product
router.post('/', authenticateToken, async (req, res) => {
  const { name, sku, barcode, price, cost, quantity, category, description, image_url } = req.body;
  try {
    const result = await runAsync(
      'INSERT INTO products (name, sku, barcode, price, cost, quantity, category, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, sku, barcode, price, cost, quantity, category, description, image_url]
    );
    res.status(201).json({ id: result.id, message: 'Product created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put('/:id', authenticateToken, async (req, res) => {
  const { name, price, cost, quantity, category, description, image_url, active } = req.body;
  try {
    await runAsync(
      'UPDATE products SET name = ?, price = ?, cost = ?, quantity = ?, category = ?, description = ?, image_url = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, price, cost, quantity, category, description, image_url, active, req.params.id]
    );
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search by barcode
router.get('/barcode/:barcode', authenticateToken, async (req, res) => {
  try {
    const product = await getAsync('SELECT * FROM products WHERE barcode = ? AND active = 1', [req.params.barcode]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
