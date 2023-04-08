import { Response } from "express";

export const defaultErrorHandler = async (
  res: Response,
  call: () => Promise<void>
) => {
  try {
    await call();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
