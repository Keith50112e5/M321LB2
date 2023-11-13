const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "secret";

const sign = (data) => jwt.sign(data, jwtSecret, { expiresIn: "1h" });

const completeVerify = (authorization) => {
  if (!authorization) return { err: "No authorization header." };

  const [prefix, token] = authorization.split(" ");

  if (prefix !== "Bearer") return { err: "Invalid authorization prefix." };

  let user;
  try {
    user = jwt.verify(token, jwtSecret);
  } catch (err) {
    return { err: err.message };
  }

  const { data } = user;

  if (!data) return { err: "Invalid Token." };

  return { data };
};

module.exports = { sign, completeVerify };
