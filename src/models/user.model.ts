import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'


const userSchema = new mongoose.Schema({

    first_name: String,
    last_name: String,
    email: {
        type: String,
        lowercase: true,
        unique: true,
        index: true,
    },
    username: {
        type: String,
        lowercase: true,
        unique: true,
        index: true,
    },
    password: String,
    balance: {
        type: Number,
        default: 0
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });



export default mongoose.model('User', userSchema);