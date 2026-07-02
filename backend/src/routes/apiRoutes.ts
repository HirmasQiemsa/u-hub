import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createTransaction, midtransWebhook } from '../controllers/billingController.js';

const router = Router();

// Route Akademik (Contoh Endpoint Mockup)
router.get('/academic', protect, (req, res) => {
  res.json({ message: "Data akademik siap dikirim" });
});

// Route Keuangan & Midtrans
router.post('/billing/pay', protect, createTransaction); // Endpoint untuk tombol "Bayar"
router.post('/billing/webhook', midtransWebhook); // GAK BOLEH di-protect, karena diakses oleh Server Midtrans

export default router;