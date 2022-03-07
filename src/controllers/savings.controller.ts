import { Request, Response } from 'express'
import dayjs from 'dayjs'

import Savings from '../models/savings.model'
import User from '../models/user.model'
import Card from '../models/card.model'

//   "amount", "frequency", "start_date", "end_date", "card"
export const createSavingPlan = async (req: Request, res: Response) => {
    console.log("create savings plan")
    const { amount, frequency, start_date, end_date, card, isAutosave, user } = req.body

    try {
        if (isAutosave) {
            const savings = await Savings.findOne({
                user: user.id,
                isAutosave: true
            })
            if (savings)
                return res.status(200).json({
                    msg: 'Cannot have multiple plans with automatic debits',
                })
        }
        const start = dayjs(start_date)
        const end = dayjs(end_date)
        if (end.diff(start, 'month') < 2)
            return res.status(200).json({
                msg: 'Mininum of 2 months for savings',
            })
        if (card) {
            const ownsCard = await Card.findOne({
                user: user.id,
                _id: card
            })
            if (!ownsCard)
                return res.status(400).json({
                    msg: 'This Card does not belong to you',
                })
        }

        const plan = await Savings.create({
            user: user.id,
            isAutosave,
            end_date: end.format("DD/MM/YYYY"),
            start_date: start.format("DD/MM/YYYY"),
            card,
            amount: Number(amount),
            frequency

        })
        return res.status(201).json({
            msg: 'Plan creation successgful 👍',
            plan
        })

    } catch (e) {
        console.log(e.message)
        return res.status(500).json({ msg: 'something went wrong creating plan', route: "/savings" })
    }


}

export const editSavingPlan = async (req: Request, res: Response) => {
    console.log("edit savings plan")
    try {
        const { amount, frequency, end_date, card, user, active } = req.body
        const { id } = req.params
        const savingsExist = await Savings.findOne({
            user: user.id,
            _id: id,
            active: true
        })
        if (!savingsExist)
            return res.status(401).json({
                msg: 'cannot perform this action',
            })
        if (card) {
            const ownsCard = await Card.findOne({
                user: user.id,
                _id: card
            })
            if (!ownsCard)
                return res.status(400).json({
                    msg: 'This Card does not belong to you',
                })
        }
        const end = dayjs(end_date)
        const now = dayjs()
        if (end.diff(now, 'month') < 2)
            return res.status(200).json({
                msg: 'Mininum of 2 months for savings',
            })
        await Savings.updateOne({
            _id: savingsExist.id
        }, {
            amount, frequency, end_date, card, user: user.id
        })
        return res.status(200).json({
            msg: 'Edit successfull',
        })
    } catch (e) {
        console.log(e.message)
        return res.status(500).json({ msg: 'something went editing plan', route: "/savings" })

    }


}

export const getSavingsPlan = async (req: Request, res: Response) => {
    const { user } = req.body
    try {
        const savings = await Savings.find({
            user: user.id
        })
        if (savings)
            return res.status(200).json({
                savings
            })
        return res.status(200).json({
            msg: "No savings is attached to this user"
        })

    } catch {
        return res.status(500).json({ msg: 'Something went wrong', route: "/savings" })
    }



}

export const withdrawSavingsPlan = async (req: Request, res: Response) => {
    try {
        const { user } = req.body
        const { id } = req.params
        const savingsExist = await Savings.findOne({
            user: user.id,
            _id: id,
            active: true
        })
        if (!savingsExist)
            return res.status(401).json({
                msg: 'cannot perform this action',
            })
        const amount = savingsExist.invested
        const activeuser = await User.findById(user.id)
        let newBalance: Number = activeuser.balance + amount

        await Savings.updateOne({
            _id: id
        }, { active: false, invested: 0 })
        await User.updateOne({
            _id: user.id
        }, {
            balance: newBalance
        })

        return res.status(200).json({
            msg: "savings Withdrawal successful"
        })

    } catch (e) {
        return res.status(500).json({ msg: 'Something went wrong', route: "/savings" })

    }
}
// move user balance to fund  a savings plan
export const fundSavingsPlan = async (req: Request, res: Response) => {
    try {
        const { user, amount } = req.body
        const { id } = req.params
        const savingsExist = await Savings.findOne({
            user: user.id,
            _id: id,
            active: true
        })
        if (!savingsExist)
            return res.status(401).json({
                msg: 'cannot perform this action',
            })
        const activeuser = await User.findById(user.id)
        if (amount > activeuser.balance)
            return res.status(401).json({
                msg: 'cannot perform this action, you are broke',
            })
        const newBalance = activeuser.balance - amount
        await User.updateOne({ _id: user.id }, { balance: newBalance })
        await Savings.updateOne({ _id: id }, { invested: amount + savingsExist.invested })
        return res.status(200).json({
            msg: 'Transafer from wallet to plan complete',
        })

    } catch (e) {
        console.log(e.meessage)
        return res.status(500).json({ msg: 'Something went wrong', route: "/savings" })

    }
}