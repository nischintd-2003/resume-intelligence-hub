import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      const result = validatedData as { body?: any; query?: any; params?: any };

      req.body = result.body;

      Object.defineProperty(req, 'query', {
        value: result.query,
        configurable: true,
        writable: true,
      });

      Object.defineProperty(req, 'params', {
        value: result.params,
        configurable: true,
        writable: true,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};
