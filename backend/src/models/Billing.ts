import mongoose, { Schema, Document } from 'mongoose';

export interface IBilling extends Document{
    userId: mongoose.Types.ObjectId;
    invoiceNumber: string;
    amount: number;
    status: 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED';
    midtransSnapToken?: string;
}

const BillingSchema: Schema = new Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['UNPAID', 'PENDING', 'PAID', 'FAILED'], default: 'UNPAID' },
    midtransSnapToken: { type: String },
}, {timestamps: true});

export default mongoose.model<IBilling>('Billing', BillingSchema);