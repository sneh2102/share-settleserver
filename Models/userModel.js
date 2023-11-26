const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt')

const creditCardModel = new mongoose.Schema({
    cardNumber: {
        type: String,
        required: true
    },
    cardHolderName:{
        type: String,
        required: true
    },
    expiryDate:{
        type: Date,
        required: true
    },
    cvv:{
        type: Number,
        required: true
    }
});

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    creditCardDetails: creditCardModel,

    groups: {
        type: Array,
        default: []
    }
});

userSchema.statics.signup = async function(name, email, password) {
    console.log(name,email,password);
    if(!email || !password || !name)
    {
        throw Error('All fields must be filled')
    }
    if(!validator.isEmail(email))
    {
        throw Error('Email is  not valid')
    }
    if(!validator.isStrongPassword(password))
    {
        throw Error('Password must contain 8 charactor, alphabats, number, special charactor')
    }
    const exists = await this.findOne({ email })
    console.log(exists);
    if (exists) {
        throw Error("Email Already Exists")  
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    console.log(hash);
    const user = await this.create({ name, email, password: hash })
    console.log(user);
    return user
}

userSchema.statics.login = async function(email, password) {
    if(!email || !password)
    {
        throw Error('All fields must be filled')
    }
    if(!validator.isEmail(email))
    {
        throw Error('Email is  not valid')
    }
    if(!validator.isStrongPassword(password))
    {
        throw Error('Password must contain 8 charactor, alphabats, number, special charactor')
    }
    const user = await this.findOne({ email })
    if (!user) {
        throw Error("Email not registored")  
    }
    const match = await bcrypt.compare(password, user.password)
    if(!match)
    {
        throw Error('Incorrect password')
    }
    return user
}
userSchema.statics.forgotpass = async function(email) {
    if(!email)
    {
        throw Error('All fields must be filled')
    }
    if(!validator.isEmail(email))
    {
        throw Error('Email is  not valid')
    }
    const user = await this.findOne({ email })
    if (!user) {
        throw Error("Email not registored")  
    }
    return user
}

userSchema.statics.resetpass = async function(id, password) {
    if(!validator.isStrongPassword(password))
    {
        throw Error('Password must contain 8 charactor, alphabats, number, special charactor')
    }
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.findByIdAndUpdate({_id: id }, {password: hash})
    if (!user) {
        throw Error("Email not registored")  
    }
    return user
}

userSchema.statics.changeUsername = async function(id, uname) {
    if (!uname) {
        throw Error('Name must be filled');
    }
    const user = await this.findByIdAndUpdate(id, { name: uname });
    return user; 
};

userSchema.statics.changePassword = async function(email ,oldPassword, newPassword, newConfirmpassword) {
    const use = await this.findOne({ email })
    const match = await bcrypt.compare(oldPassword, use.password)
    if(!match)
    {
        throw Error('Incorrect password')
    }
    if(newPassword!=newConfirmpassword)
    {
        throw Error('Password dont match.')
    }
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(newPassword, salt)

    const user = await this.findByIdAndUpdate(use._id, { password: hash });
    
    return user;


};
userSchema.statics.getUser = async function() {
    const user = await this.find();
    return user;


};



module.exports = mongoose.model('User', userSchema)
