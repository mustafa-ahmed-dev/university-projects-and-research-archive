import jwt, {
  TokenExpiredError,
  JsonWebTokenError,
  NotBeforeError,
} from "jsonwebtoken";

import asyncHandler from "./asyncHandler.helper";
import InternalServerError from "./../errors/InternalServerError";
import UnauthorizedError from "./../errors/UnauthorizedError";
import config from "./../../config";

export interface JWTPayload {
  username: string;
}

const signToken = async (data: JWTPayload, expiresIn?: number) => {
  try {
    const token = jwt.sign(data, config.jwtPrivateKey, {
      expiresIn: expiresIn || 0,
    });

    return token;
  } catch (error) {
    const UnauthorizedErrors = [
      SyntaxError,
      NotBeforeError,
      TokenExpiredError,
      JsonWebTokenError,
    ];

    /**
     * @desc if the error is instance of one of the above errors then
     *       the token is invalid
     */
    throw UnauthorizedErrors.some((err) => error instanceof err)
      ? new UnauthorizedError("Invalid Token")
      : new InternalServerError(error.message);
  }
};

const decodeToken = async (token: string) => {
  try {
    const payload = <JWTPayload>jwt.decode(token);

    return payload;
  } catch (error) {
    const UnauthorizedErrors = [
      SyntaxError,
      NotBeforeError,
      TokenExpiredError,
      JsonWebTokenError,
    ];

    /**
     * @desc if the error is instance of one of the above errors then
     *       the token is invalid
     */
    throw UnauthorizedErrors.some((err) => error instanceof err)
      ? new UnauthorizedError("Invalid Token")
      : new InternalServerError(error.message);
  }
};

const signAccessToken = async (data: any) => {
  let token: string;
  try {
    token = jwt.sign(data, config.jwtPrivateKey, {
      expiresIn: "15m",
    });

    return token;
  } catch (error) {
    const UnauthorizedErrors = [
      SyntaxError,
      NotBeforeError,
      TokenExpiredError,
      JsonWebTokenError,
    ];

    /**
     * @desc if the error is instance of one of the above errors then
     *       the token is invalid
     */
    throw UnauthorizedErrors.some((err) => error instanceof err)
      ? new UnauthorizedError("Invalid Token")
      : new InternalServerError(error.message);
  }
};

const verifyToken = async (token: string) => {
  try {
    const payload = <JWTPayload>jwt.verify(token, config.jwtPrivateKey);
    return payload;
  } catch (error) {
    const UnauthorizedErrors = [
      SyntaxError,
      NotBeforeError,
      TokenExpiredError,
      JsonWebTokenError,
    ];

    /**
     * @desc if the error is instance of one of the above errors then
     *       the token is invalid
     */
    throw UnauthorizedErrors.some((err) => error instanceof err)
      ? new UnauthorizedError("Invalid Token")
      : new InternalServerError(error.message);
  }
};

export { signToken, signAccessToken, verifyToken, decodeToken };
