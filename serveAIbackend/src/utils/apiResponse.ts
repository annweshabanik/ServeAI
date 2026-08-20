import { Response } from 'express';

export interface ApiResponsePayload<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
}

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T
): Response => {
    const payload: ApiResponsePayload<T> = {
        success: statusCode >= 200 && statusCode < 300,
        message,
        ...(data !== undefined && {data}),
    };

    return res.status(statusCode).json(payload);
};