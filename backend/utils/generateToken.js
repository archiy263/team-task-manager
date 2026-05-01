import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  // Use 'id' as the key so protect & isAdmin middlewares can do decoded.id
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const isProduction = process.env.NODE_ENV === "production";
  const isRailway = process.env.RAILWAY_STATIC_URL || process.env.PORT; // Helper to detect cloud environment

  res.cookie("jwt", token, {
    httpOnly: true,
    signed: true,
    secure: true, // Always true for modern browsers in production
    sameSite: "None", // Required for cross-domain cookies
    path: "/",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return token;
};

export default generateToken;
