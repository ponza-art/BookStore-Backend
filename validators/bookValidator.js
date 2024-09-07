
const { object, string } = require  ('joi');

const bookSchemaJoi = object({
  title: string().required(),
  description: string().required(),
  sourcePath: string().required(),
});

module.exports=  bookSchemaJoi ;