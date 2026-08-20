export class AppError extends Error {
    public readonly statusCode : number;
     public readonly isOperational : boolean;
     // The constructor initializes the AppError instance with a message and a status code. It also sets the isOperational property to true, indicating that this error is an operational error (as opposed to a programming error). The prototype chain is restored to ensure that instances of AppError have the correct prototype, and the stack trace is captured for debugging purposes.

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        // Set the prototype explicitly to maintain the correct prototype chain for instances of AppError.

        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        Error.captureStackTrace(this, this.constructor); // capture stack trace
    }

}