import { Request , Response , NextFunction , RequestHandler} from 'express';

export const asyncHandler = (fn: RequestHandler): RequestHandler => { // The asyncHandler function takes an asynchronous function (fn) as an argument and returns a new function that wraps the original function in a Promise. This allows for proper error handling in asynchronous routes.
    return (req:Request, res:Response , next:NextFunction) =>{
        Promise.resolve(fn(req,res,next)).catch(next); // Catch any errors thrown in the async function and pass them to the next middleware (error handler)
    }
}

