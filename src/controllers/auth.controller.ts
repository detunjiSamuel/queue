import { Request, Response } from 'express'
import User from '../models/user.model'
import emailVerification from '../models/emailVerification.model'
import authService from '../services/auth.service'
import redisClient from '../config/redis'



const service = new authService()
const cache = new redisClient()

export const register = async (req: Request, res: Response) => {

    const { first_name, last_name, email, password, username } = req.body

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] })
        if (userExists) {
            return res.status(404).json({
                msg: 'Username/email already exists',
            })
        }

        const user = await User.create({
            first_name,
            last_name,
            email, password,
            username
        })
        await service.sendEmailVerification(email)
        return res.status(201).json({
            msg: 'Account Created',
            user: {
                email: user.email || 'test',
                username: user.username || 'more'
            }
        })

    } catch (e) {
        console.log("registration failed", e.message)
        return res.status(500).json({ msg: ' User registration failed', route: "/user/register" })
    }
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
        if (!user)
            return res.status(400).json({ msg: 'No user found with this email' });
        if (!user.isEmailVerified)
            return res.status(400).json({ msg: 'Email not verified' })
        // validate password
        const isPassword = await service.checkPassword(password, user.password)
        if (!isPassword)
            return res.status(400).json({ msg: 'Incorrect Password' })
        const data = {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            id: user._id
        }
        const authToken = await service.createToken(data)
        await cache.add(data.id, authToken)
        return res.status(200).json({
            msg: 'Login Successful!',
            data,
            authToken,
        })
    }
    catch (e) {
        return res.status(500).json({ msg: 'failed to create account', route: "/user/register" })
    }
}



export const logout = async (req: Request, res: Response) => {
    const { user } = req.body;
    try {
        const removedToken = await cache.delete(user.id)
        return res.status(200).json({
            msg: 'Logout Successful!'

        })
    } catch (error) {
        return res.status(500).json({ msg: 'failed to logout', route: "/user/logout" })
    }
}



export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params
    try {
        const isValidToken = await service.verifyToken(token)
        if (!isValidToken)
            return res.status(400).json({ msg: 'Email Link Expired' });
        const tokenExists = await emailVerification.findOne({ token })
        if (!tokenExists)
            return res.status(400).json({ msg: 'Unable to verify email, please try again' });

        const user = await User.updateOne({ email: tokenExists.email }, { isEmailVerified: true })
        await emailVerification.deleteOne({ token })
        return res.status(200).json({
            msg: 'Email Verified!',
        })


    } catch (e) {
        return res.status(500).json({ msg: 'failed to verify email. Please, try again', route: "/email/resendverification" })
    }
}




export const resendEmailVerification = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email })
        if (!user)
            return res.status(400).json({ msg: 'Email not found' });
        if (user.isEmailVerified)
            return res.status(400).json({ msg: 'Email verified already' });
        await service.sendEmailVerification(email)
        return res.status(200).json({
            msg: 'Verification Email Resent!',
            email
        })
    } catch (error) {
        return res.status(500).json({ msg: 'failed to resend email', route: "/email/resendverification" })
    }
}

