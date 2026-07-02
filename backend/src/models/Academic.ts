import mongoose, { Schema, type Document } from 'mongoose';

export interface IAcademic extends Document {
    userId: mongoose.Types.ObjectId;
    ipk: number;
    totalSks: number;
    major: string;
}

const AcademicSchema: Schema<IAcademic> = new Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    ipk: { type: Number, required: true },
    totalSks: { type: Number, required: true },
    major: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IAcademic>('Academic', AcademicSchema);