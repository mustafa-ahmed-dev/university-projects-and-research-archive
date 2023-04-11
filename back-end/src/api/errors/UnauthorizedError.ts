import HttpError from "./HttpError";

class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(401, message);
  }
}

export default UnauthorizedError;
