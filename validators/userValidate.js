const { object, string } = require  ('joi');

const userSchemaJoi = object({
  username: string().min(3).max(30).required(),
  email: string().email().required(),
  password: string().min(6).required(),
  role: string()
});

module.exports= userSchemaJoi ;