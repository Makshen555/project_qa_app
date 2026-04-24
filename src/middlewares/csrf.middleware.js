import csrf from "csurf";

const isProduction = process.env.NODE_ENV === "production";

export const csrfProtection = csrf({
  cookie: {
    key: "_csrf",
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  },
});