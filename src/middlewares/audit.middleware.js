export const getRequestInfo = (req) => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    req.ip;

  return {
    ipAddress: ip,
  };
};