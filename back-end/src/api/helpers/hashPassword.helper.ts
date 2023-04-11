import argon2 from "argon2";

const hashPassword = async (password: string) => await argon2.hash(password);

const verifyPassword = async (plainPassword: string, hashedPassword: string) =>
  await argon2.verify(hashedPassword, plainPassword);

export { hashPassword, verifyPassword };
