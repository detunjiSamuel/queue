import { emailQueue } from '../config/bull'
import emailVerification from '../models/emailVerification'
import { sign, verify } from 'jsonwebtoken';
import { nanoid } from 'nanoid'
import config from '../config'
import bcrypt from 'bcrypt'

const { secret, expiry } = config.jwt
class Auth {

    async sendEmailVerification(email: String) {
        try {
            const id = nanoid()
            const token = await this.createToken({ email, id })
            const link = `${config.host}/api/v1/email/verify/${token}`
            await emailVerification.create({
                id,
                token,
                email
            })
            
            emailQueue.add({
                payload: {
                    to: email,
                    subject: 'verify email',
                    html: `<p>Email Verification Link: <a>${link}</a></p>`
                }

            })
            return { msg: 'Email Verification Sent', emailVerification }

        } catch (e) {
            throw new Error('failure in sendEmailVerification')
        }
    }
    createToken(data: object) {
        const token = sign(data, secret,
            { algorithm: 'HS256', expiresIn: expiry }
        )
        return token;
    }

    verifyToken(token: string) {
        const decoded = verify(token, secret)
        return decoded

    }

    async checkPassword(value: String, hashedString: string) {
        const isMatch = await bcrypt.compare(value, hashedString)
        return isMatch
    }
}

export default Auth