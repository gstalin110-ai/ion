const express = require('express');
const { body, validationResult } = require('express-validator');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get wallet
router.get('/', auth, async (req, res) => {
  try {
    const wallet = await Wallet.getOrCreate(req.user.id);
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get wallet stats
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Wallet.getStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      limit: req.query.limit || 50,
      offset: req.query.offset || 0
    };

    const transactions = await Transaction.findByUser(req.user.id, filters);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deposit (add funds)
router.post('/deposit', auth, [
  body('amount').isFloat({ min: 1 }),
  body('method').isIn(['card', 'bank_transfer', 'digital_wallet']),
  body('reference').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, method, reference } = req.body;

    // Update wallet balance
    await Wallet.updateBalance(req.user.id, amount, 'credit');

    // Create transaction
    const transaction = await Transaction.create({
      user_id: req.user.id,
      type: 'deposit',
      amount,
      description: `Deposit via ${method}`,
      status: 'completed',
      reference_id: reference,
      metadata: { method }
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer to another user
router.post('/transfer', auth, [
  body('to_user_id').isInt(),
  body('amount').isFloat({ min: 1 }),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { to_user_id, amount, description } = req.body;

    if (to_user_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot transfer to yourself' });
    }

    const transactions = await Transaction.createTransfer(
      req.user.id,
      to_user_id,
      amount,
      description || 'Transfer'
    );

    res.status(201).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request withdrawal
router.post('/withdraw', auth, [
  body('amount').isFloat({ min: 10 }),
  body('method').isIn(['bank_transfer', 'digital_wallet']),
  body('bank_name').optional().trim(),
  body('account_number').trim(),
  body('account_holder').trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, method, bank_name, account_number, account_holder } = req.body;

    // Check wallet balance
    const wallet = await Wallet.findByUser(req.user.id);
    if (!wallet || parseFloat(wallet.available_balance) < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Freeze amount
    await Wallet.freezeAmount(req.user.id, amount);

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user_id: req.user.id,
      amount,
      method,
      bank_name,
      account_number,
      account_holder
    });

    // Create transaction
    await Transaction.create({
      user_id: req.user.id,
      type: 'withdrawal',
      amount,
      description: `Withdrawal via ${method}`,
      status: 'pending',
      reference_id: withdrawal.id.toString()
    });

    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get withdrawals
router.get('/withdrawals', auth, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.findByUser(req.user.id);
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
