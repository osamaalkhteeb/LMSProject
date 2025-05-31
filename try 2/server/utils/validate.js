import Joi from "joi";
import { HTTP_STATUS } from "../config/constants.js";

export const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: "Validation failed",
      details: errors,
    });
  }
  next();
};

export const schema = {
  register: Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
}),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  createCourse: Joi({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().max(500).optional(),
  }),
};
