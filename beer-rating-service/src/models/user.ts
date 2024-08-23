import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the User interface extending Mongoose's Document
export interface IUser extends Document {
    username: string;
    password: string;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

// Define the schema for User
const userSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

// Middleware to hash the password before saving a user
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model with the IUser interface
export default mongoose.model<IUser>('User', userSchema);
