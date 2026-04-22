import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secret_key";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    SECRET,
    { expiresIn: "1h" }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};