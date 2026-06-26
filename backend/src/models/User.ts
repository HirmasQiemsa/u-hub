import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    nim: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'mahasiswa' | 'dosen' | 'admin';
}

const UserSchema: Schema = new Schema({
    nim: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['mahasiswa', 'dosen', 'admin'], default: 'mahasiswa' },
}, {timestamps: true});

export default mongoose.model<IUser>('User', UserSchema);