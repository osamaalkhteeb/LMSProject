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

  //Auth schemas
  register: Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
}),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
  
  //User profile schemas
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    bio: Joi.string().max(500).optional().allow(''),
    avatar_url: Joi.string().uri().optional().allow('')
  }),

   changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  }),

  // Course schemas
   createCourse: Joi.object({
    title: Joi.string().min(5).max(150).required(),
    description: Joi.string().max(1000).optional(),
    category_id: Joi.number().integer().positive().optional(),
    price: Joi.number().min(0).precision(2).optional(), //add on
    thumbnail_url: Joi.string().uri().optional()
  }),

  updateCourse: Joi.object({
    title: Joi.string().min(5).max(150).optional(),
    description: Joi.string().max(1000).optional(),
    category_id: Joi.number().integer().positive().optional(),
    price: Joi.number().min(0).precision(2).optional(), //add on
    thumbnail_url: Joi.string().uri().optional(),
    is_published: Joi.boolean().optional()
  }),

  // Module schemas
  createModule: Joi.object({
    title: Joi.string().min(3).max(150).required(),
    description: Joi.string().max(500).optional(),
    order_num: Joi.number().integer().min(1).required()
  }),

   // Lesson schemas
  createLesson: Joi.object({
    title: Joi.string().min(3).max(150).required(),
    content_type: Joi.string().valid('video', 'quiz', 'text').required(),
    content_url: Joi.string().uri().optional(),
    duration: Joi.number().integer().min(1).optional()
  }),

   // Quiz schemas
  createQuiz: Joi.object({
    question: Joi.string().min(10).required(),
    options: Joi.array().items(Joi.string()).min(2).max(6).required(),
    correct_answer: Joi.string().required()
  }),

  // Assignment schemas
  createAssignment: Joi.object({
    title: Joi.string().min(5).max(150).required(),
    description: Joi.string().min(10).required(),
    deadline: Joi.date().greater('now').required()
  })
};


