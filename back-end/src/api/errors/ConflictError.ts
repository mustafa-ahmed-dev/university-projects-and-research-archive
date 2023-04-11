import HttpError from "./HttpError";

class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

export default ConflictError;
