import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface biar bisa nampung data user
export interface AuthRequest extends Request {
  user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 1. Guard Clause (Cek header authorization)
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Akses ditolak, tidak ada token' });
    return;
  }

  // 2. Eksekusi Token
  try {
    // TypeScript strict mode (noUncheckedIndexedAccess) menganggap hasil split() 
    // bisa jadi undefined, jadi kita gunakan "as string" karena kita sudah 
    // validasi pakai startsWith('Bearer ') di atas.
    const token = req.headers.authorization.split(' ')[1] as string;
    
    // Pastikan variabel environment ada (untuk menghindari undefined juga)
    const secret = process.env.JWT_SECRET as string;

    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Masukin data user ke request
    next(); // Lanjut ke controller
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid atau kadaluarsa' });
  }
};