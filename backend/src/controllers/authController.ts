import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const {nim,name,email,password,role} = req.body;

        // Check if user already exists
        const existingUser = await User.findOne ({ $or: [{ email }, { nim }] });
        if (existingUser) {
            res.status(400).json({ message: 'User dengan Email atau NIM ini sudah tersedia' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({
            nim,
            name,
            email,
            passwordHash,
            role: role || 'mahasiswa',
        });
        
        res.status(201).json({ message: 'Registrasi berhasil', userId: newUser._id});
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Email atau password salah' });
            return;
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ message: 'Email atau password salah' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login berhasil', token, userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};