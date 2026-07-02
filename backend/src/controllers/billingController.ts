import { type Request, type Response } from 'express';
import { type AuthRequest } from '../middlewares/authMiddleware.js';
import Billing from '../models/Billing.js';
// @ts-ignore: Tipe bawaan dari komunitas @types/midtrans-client kurang lengkap
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY as string,
    clientKey: process.env.MIDTRANS_CLIENT_KEY as string || '',
});

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { amount, invoiceNumber } = req.body;
        const userId = req.user?.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Create a new billing record in the database
        const newBilling = await Billing.create({
            userId,
            invoiceNumber,
            amount,
            status: 'UNPAID',
        });

        // Create a transaction with Midtrans
        const parameter = {
            transaction_details: {
                order_id: invoiceNumber,
                gross_amount: amount,
            },
        };

    // Create a transaction with Midtrans
    const transaction = await snap.createTransaction(parameter);

    // Save the Midtrans snap token to the billing record
    newBilling.midtransSnapToken = transaction.token;
    await newBilling.save();

    res.status(200).json({ token: transaction.token,
        redirect_url: transaction.redirect_url });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create transaction', error });
    }
};

export const midtransWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const notificationJson = req.body;

        // Midtrans nge-post data kesini, kita proses dengan SDK mereka
        // @ts-ignore: Tipe bawaan dari komunitas @types/midtrans-client kurang lengkap
        const statusResponse = await (snap as any).transaction.notification(notificationJson);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;

        if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
            await Billing.findOneAndUpdate({ invoiceNumber: orderId }, { status: 'PAID' });
        } else if (transactionStatus === 'cancel' ||transactionStatus === 'expire') {
            await Billing.findOneAndUpdate({ invoiceNumber: orderId }, { status: 'FAILED' });
        }

        res.status(200).json({message: 'Notification received', status: transactionStatus });
    } catch (error) {
        res.status(500).json({ message: 'Failed to process webhook', error });
    }
};