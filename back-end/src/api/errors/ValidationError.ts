import HttpError from "./HttpError";

class ValidationError extends HttpError {
  constructor(message: string) {
    super(422, message);
  }
}

export default ValidationError;
