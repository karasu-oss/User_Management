import Joi from 'joi';

export const UsersValidator = (data) => {
  const users = Joi.object({
    fullname: Joi.string().required(),
    birthDate: Joi.date().iso().required(),
    gmail: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid("admin", "user").default("user"),
  status: Joi.string().valid("active", "blocked").default("active"),
    
  });
  return users.validate(data);
};
