const jwt = require('jsonwebtoken');
const process = require('process');

module.exports=async(payload)=>{
    const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY);
    return token
}