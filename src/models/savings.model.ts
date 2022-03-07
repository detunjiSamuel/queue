import * as mongoose from 'mongoose'


const savingSchema = new mongoose.Schema({

    frequency: String,
    start_date: Date,
    end_date: Date,
    isAutosave: {
        type: Boolean,
        default: false
    },
    amount: {
        type: Number,
        default: 0
    },
    invested: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    },

    card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });




export default mongoose.model('Savings', savingSchema);