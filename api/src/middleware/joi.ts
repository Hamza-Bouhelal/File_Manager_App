// import joi for typescript
import { Response } from "express";
import * as joi from "joi";

export const authValidator = joi.object({
  username: joi.string().min(3).max(20).required(),
  password: joi.string().min(3).max(20).required(),
});

export const tokenValidator = joi.object({
  token: joi.string().required(),
});

export const fileTextValidator = joi.object({
  path: joi.string().allow("").required(),
  file: joi.string().required(),
  content: joi.string().required(),
});

export const deleteFileOrFolderValidator = joi.object({
  path: joi.string().required(),
});

export const readDirValidator = joi.object({
  path: joi.string().allow("").required(),
});

export const readFileValidator = joi.object({
  path: joi.string().allow("").required(),
  file: joi.string().required(),
});

export const renameValidator = joi.object({
  path: joi.string().required(),
  newPath: joi.string().required(),
});

export const joiBodyValidator = (
  res: Response,
  schema: joi.ObjectSchema,
  body: any
) => {
  const { error } = schema.validate(body);
  if (error) {
    res.status(400).send({ message: error.details[0].message, status: 400 });
    return false;
  }
  return true;
};
