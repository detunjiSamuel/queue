
import * as mongoose from 'mongoose'


const cardSchema = new mongoose.Schema({
    first_6digits: String,
    last_4digits: String,
    issuer: String,
    country: String,
    type: String,
    expiry: String
})

const transactionSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    payment_type: {
        type: String
    },
    tx_ref: {
        type: String,
    },
    flw_ref: {
        type: String,
    },
    amount: {
        type: Number,
    },
    charged_amount: {
        type: String,
    },
    status: {
        type: String
    },
    card: {
        type: cardSchema,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
export default mongoose.model('transaction', transactionSchema);