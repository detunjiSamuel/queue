import { body } from 'express-validator'


export const checkCoinRequest = () => {
    return [
        body('fullname').notEmpty().withMessage('Please, provide a name'),
        body('email').notEmpty().isEmail().withMessage('Please, provide a valid email'),
        body('coinAddress').notEmpty().withMessage('Please, provide a wallet address'),
        body('value').notEmpty().withMessage('Please, provide amount of coin')
    ]
}