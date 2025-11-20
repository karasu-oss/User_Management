import { hash, compare } from "bcrypt";

export const hashPassword = async (password, saltRounds = 7) => {
    return await hash(password, saltRounds);
};

export const verifyPassword = async (password, hashedPassword) => {
    return await compare(password, hashedPassword);
};
