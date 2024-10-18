const validateRequest = (schema) => {
    return (req, res, next) => {

      const { body, files } = req;
  
      const dataToValidate = {
        ...body,
        image: files && files["file"] ? files["file"][0] : undefined,
      };
  
      const { error } = schema.validate(dataToValidate, { abortEarly: false });
  
      if (error) {
        const errorMessages = error.details.map((err) => err.message); 
        return res.status(400).json({ errors: errorMessages }); 
      }
      next(); 
    };
  };
  
  module.exports ={ validateRequest};