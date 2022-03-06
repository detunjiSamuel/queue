import { Router, Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'



export const handleValidation = async (req: Request, res: Response, next: NextFunction) => {
    const isError = validationResult(req);
    if (isError.isEmpty())
        return next();
    return res.status(400).json(isError.array()[0])
}
