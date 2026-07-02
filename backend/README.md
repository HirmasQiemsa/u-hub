# 🗺️ Peta Alur Backend U-Hub (Master Plan)

Sistem kita sekarang butuh 3 pilar tambahan yang dilindungi oleh satu satpam (Middleware).

### Satpam (Auth Middleware):
Setiap kali Frontend mau narik data nilai, buku, atau tagihan, mereka wajib bawa JWT Token hasil login tadi. Middleware ini bakal ngecek: *"Token lu valid gak? Lu beneran mahasiswa A bukan?"* Kalau valid, boleh lewat.

### Modul Akademik & Perpus (Mockup/Aggregator):
Ini ibarat Siadin. Alurnya simpel: Frontend minta data $\rightarrow$ Controller narik data dari MongoDB berdasarkan ID user yang login $\rightarrow$ Kirim balasan JSON (IPK, SKS, Buku Dipinjam).

### Modul Keuangan (Integrasi Midtrans):
Ini yang paling kompleks dan mahal di industri. Alurnya:
1. **Create Transaction**: Mahasiswa klik "Bayar UKT" di Frontend $\rightarrow$ Backend terima request $\rightarrow$ Backend nge-hit API Midtrans $\rightarrow$ Midtrans ngasih `snap_token` $\rightarrow$ Backend simpan token ke DB dan balikin ke Frontend.
2. **Webhook (Notifikasi Otomatis)**: Mahasiswa selesai bayar di ATM/Gopay $\rightarrow$ Server Midtrans bakal nembak (mengirim POST request) ke Backend kita secara otomatis $\rightarrow$ Backend kita ngecek signature key Midtrans $\rightarrow$ Kalau valid, status di MongoDB kita ubah dari `UNPAID` jadi `PAID`.

---

## 🛠️ Eksekusi: Papras Habis Backend!

Sebelum mulai ngetik, silakan buka GitHub lu dan bikin Issue baru. Kasih judul: `[Backend] Complete Core Modules & Midtrans Integration`. Kalau udah dapet nomornya, bikin branch baru: `git checkout -b feature/issue-2-core-backend`.

Kalau udah di branch yang bener, mari kita eksekusi berurutan:

### Langkah 1: Bikin Satpam (Auth Middleware)
Bikin file baru di `backend/src/middlewares/authMiddleware.ts`. Ini wajib biar route kita gak bisa ditembak orang sembarangan.

```typescript
import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface biar bisa nampung data user
export interface AuthRequest extends Request {
  user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 1. Guard Clause (Optimasi: Hindari if-else bersarang)
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Akses ditolak, tidak ada token' });
    return;
  }

  // 2. Eksekusi Token
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; // Masukin data user ke request
    next(); // Lanjut ke controller
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};
```

### Langkah 2: Selesaikan Model Database yang Kurang
Kemarin kita udah bikin User dan Billing. Sekarang bikin sisa datanya.
Buat file `backend/src/models/Academic.ts`:

```typescript
import mongoose, { Schema, type Document } from 'mongoose';

export interface IAcademic extends Document {
  userId: mongoose.Types.ObjectId;
  ipk: number;
  totalSks: number;
  major: string;
}

const AcademicSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ipk: { type: Number, required: true, default: 0 },
  totalSks: { type: Number, required: true, default: 0 },
  major: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IAcademic>('Academic', AcademicSchema);
```

### Langkah 3: Controller Keuangan & Midtrans (The Core)
Ini bagian paling industry-level. Buat file `backend/src/controllers/billingController.ts`. Pastikan lu udah bikin akun Midtrans Sandbox dan naruh `MIDTRANS_SERVER_KEY` di file `.env` lu.

```typescript
import { type Request, type Response } from 'express';
import { type AuthRequest } from '../middlewares/authMiddleware.js';
import Billing from '../models/Billing.js';
// @ts-ignore
import midtransClient from 'midtrans-client';

// Setup Midtrans Core
const snap = new midtransClient.Snap({
  isProduction: false, // Kita pakai Sandbox mode
  serverKey: process.env.MIDTRANS_SERVER_KEY as string,
});

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, invoiceNumber } = req.body;
    const userId = req.user?.user?.id; // Gunakan optional chaining

    if (!userId) {
      res.status(400).json({ message: 'Data user tidak valid' });
      return;
    }

    // 1. Simpan tagihan awal ke database
    const newBilling = await Billing.create({
      userId,
      invoiceNumber,
      amount,
      status: 'UNPAID',
    });

    // 2. Siapkan parameter untuk Midtrans
    const parameter = {
      transaction_details: {
        order_id: invoiceNumber,
        gross_amount: amount,
      },
    };

    // 3. Tembak API Midtrans untuk dapet Snap Token
    const transaction = await snap.createTransaction(parameter);
    
    // 4. Update DB dengan token & kembalikan ke Frontend
    newBilling.midtransSnapToken = transaction.token;
    await newBilling.save();

    res.status(200).json({ token: transaction.token, redirect_url: transaction.redirect_url });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat transaksi', error });
  }
};

export const midtransWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const notificationJson = req.body;
    
    // Midtrans nge-post data kesini, kita proses dengan SDK mereka
    const statusResponse = await snap.transaction.notification(notificationJson);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;

    // Logic update status pembayaran (Standar Resmi Midtrans)
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      await Billing.findOneAndUpdate({ invoiceNumber: orderId }, { status: 'PAID' });
    } else if (transactionStatus === 'cancel' || transactionStatus === 'expire') {
      await Billing.findOneAndUpdate({ invoiceNumber: orderId }, { status: 'FAILED' });
    }

    res.status(200).json({ message: 'Webhook berhasil diproses' });
  } catch (error) {
    res.status(500).json({ message: 'Webhook error' });
  }
};
```

### Langkah 4: Rangkai Semua di Router
Buat file `backend/src/routes/apiRoutes.ts`. Di sini kita kumpulin semuanya dan pasangin si Satpam (protect).

```typescript
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
```

Terakhir, daftarin `apiRoutes.ts` ini ke `server.ts` lu tepat di bawah route auth yang kemarin:

```typescript
import apiRoutes from './routes/apiRoutes.js';
app.use('/api', apiRoutes);
```