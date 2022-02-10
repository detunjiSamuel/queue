
import * as mongoose from 'mongoose'


const transactionSchema = new mongoose.Schema({
    txRef: {
        type: String,
        trim: true,
    },
    ip: {
        type: String,
        trim: true,
    },
    amount: {
        type: Number,
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});
export default mongoose.model('Transaction', transactionSchema);