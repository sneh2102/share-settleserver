const User = require('../Models/userModel')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const notificationHandler = require('../helper/NotificationHandler');
const bankModel = require('../PaymentProcessor/bankModel')

const { createBankAccount}=bankModel;


const createToken = (_id) =>{
   return jwt.sign({_id}, process.env.JWTTOKEN, {expiresIn: '3d'})
}

const loginUser = async (req, res) => {
    const {email, password} = req.body
    try{
        const user = await User.login(email, password)
        const token= createToken(user._id)
        res.status(200).json({email,token,user})
    } catch(error)
    {
        res.status(400).json({error: error.message})
    }
}

const signupUser = async (req, res) => {
    const {name, email, password} = req.body
    console.log(req.body);
    try{
        const user = await User.signup(name ,email, password)
        console.log(user);
        const token= createToken(user._id)
        const param={
          email: user.email, 
          user1: user.name, 
          groupName: null, 
          action: 'userSignup',
          user2: null, 
          Status: null,
          amount: null,
          date: null}
         notificationHandler(param);
        res.status(200).json({email,token,user})
    } catch(error)
    {
      
        res.status(400).json({error: error.message})
    }
}

const resetPassUser = async (req, res) => {
  const { id, token } = req.params;

  const { password } = req.body;
  try {
       
  const user = await User.resetpass(id, password);
    
    const newToken = createToken(user._id);
    const param =
    {
      email: user.email, 
      user1: user.name, 
      groupName: null, 
      action: 'resetPassword',
      user2: null, 
      Status: null,
      amount: null,
      date: null
    }
    notificationHandler(param);
    res.status(200).json(param);
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      res.status(400).json({ error: 'Invalid token' });
    } else if (err.name === 'TokenExpiredError') {
      res.status(400).json({ error: 'Token expired' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
};


const forgotPassUser = async (req, res) => {
    const {email} = req.body
    try{
        const user = await User.forgotpass(email)
        const token= createToken(user._id)
        const transporter = nodemailer.createTransport({
          host: "smtp-mail.outlook.com",
          secureConnection: false,
          port: 587,
          tls: {
            ciphers:'SSLv3'
          },
          auth: {
            user: 'sharesettle@outlook.com',
            pass: 'Group1asdc'
          }
          });
          
          let mailOptions = {
            from: 'sharesettle@outlook.com',
            to: email,
            subject: 'Reset Your Password',
            text: `http://localhost:3000/reset-password/${user._id}/${token}`
          };
          
          const response = transporter.sendMail(mailOptions);
          if(response)
          {
            res.status(200).json({response})
          }
          else{
            res.status(400).json({error: "Something Went Wrong"})
          }
    } catch(error)
    {
        res.status(400).json({error: error.message})
    } 
}

const changeUsername = async (req, res) => {
  const { id, name } = req.body;
  try {
    const user = await User.changeUsername(id, name);
    const params={
      email: user.email, 
      user1: user.name, 
      groupName: null, 
      action: 'changeUsername',
      user2: null, 
      Status: null,
      amount: null,
      date: null}
    notificationHandler(params);
    res.status(200).json({ email: user.email, token: user.token, user });
  } catch (err) {
    res.status(500).json({error: "Internal server error"})
  }
};



const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword, newConfirmPassword} = req.body;
  try {
    const user = await User.changePassword(email, oldPassword, newPassword, newConfirmPassword);
    const param={
      email: user.email, 
      user1: user.name, 
      groupName: null, 
      action: 'passwordChange',
      user2: null, 
      Status: null,
      amount: null,
      date: null
    }
    await notificationHandler(param);
    res.status(200).json({ user });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      res.status(400).json({ error: 'Invalid token' });
    } else if (err.name === 'TokenExpiredError') {
      res.status(400).json({ error: 'Token expired' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
}

const getUser = async (req,res) => {
    try {
      const user = await User.getUser();
      res.status(200).json({ user });
    } catch (err) {
    }
  
};
const addCardDetailsToUser = async (req, res) => {
  const { id,cardNumber, cardHolderName, expiryDate, cvv } = req.body;

  try {
      const user = await User.findById(id);

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }
      
      user.creditCardDetails = {
          cardNumber,
          cardHolderName,
          expiryDate,
          cvv
      };
      

     const savedUser = await user.save();
     createBankAccount(savedUser.name,savedUser.email,user.creditCardDetails)

      res.status(200).json({ message: 'Card details added successfully', user });
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports = { signupUser, loginUser ,forgotPassUser, resetPassUser, changeUsername, changePassword, getUser, addCardDetailsToUser}