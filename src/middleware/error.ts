import { Request, Response, NextFunction } from 'express';

const handleError = (err, req: Request, res: Response, next: NextFunction) => {
  if (err.status === undefined)
    return res.status(500).json({
      msg: 'Something went wrong from our end',
      endpoint: req.url,
    });
  return res.status(err.status).json({
    msg: err.message,
    endpoint: req.url,
  });
};

export default handleError;
