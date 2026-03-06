import { jwtVerify, SignJWT } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret || secret.length === 0) {
    return "super-secret-key-for-visitor-app-local";
  }
  return secret;
};

export const verifyAuth = async (token: string) => {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified.payload as { id: string; role: string; email: string; name?: string };
  } catch (err) {
    throw new Error("Your token has expired.");
  }
};

export const signToken = async (payload: { id: string; role: string; email: string; name: string }) => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(new TextEncoder().encode(getJwtSecretKey()));

  return token;
};
