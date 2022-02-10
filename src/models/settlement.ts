
import * as mongoose from 'mongoose'

const settlementSchema = new mongoose.Schema({
    address: {
        type: String,
        trim: true,
    },
    usdt: {
        type: String,
        trim: true,
    },
    additonalCharge: {
        type: Number,
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});
export default mongoose.model('Settlement', settlementSchema);