import HttpError from "./HttpError";

class ForbiddenError extends HttpError {
  constructor(message?: string) {
    super(403, message || "You are not allowed to to do that");
  }
}

export default ForbiddenError;
