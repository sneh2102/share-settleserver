// const jwt = require('jsonwebtoken')
// const User = require('../Models/userModel')

// const AuthCheck = async (req, res, next) => {
//     const { authorization } = req.headers

//     if(!authorization)
//     {
//         return res.status(401).json({error: "Authorization Required"})
//     }
//     const token = authorization.split(' ')

//     try {
//         const {_id} = jwt.verify(token, process.env.JWTTOKEN)
//         req.user = await User.findOne({_id}).select('_id')
//         next()
//     } catch(error) {
//         console.log(error);
//         res.status(401).json({error: 'Not Authorized'})
//     }
// }

// module.export = AuthCheck