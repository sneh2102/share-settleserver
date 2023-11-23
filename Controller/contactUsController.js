const nodemailer = require('nodemailer');

const contactUs = (req, res) => {
    const {name, email, subject, message} = req.body;
   
    const transporter = nodemailer.createTransport({
        host: process.env.CONTACTUS_EMAIL_HOST,
        secureConnection: false,
        port: 587,
        tls: {
            ciphers:'SSLv3'
        },
        auth: {
            user: process.env.CONTACTUS_USERNAME,
            pass: process.env.CONTACTUS_PASSWORD
        }
    });
    
    var mailOptions = {
        from: process.env.CONTACTUS_USERNAME,
        to: process.env.SHARESETTLE_EMAIL,
        subject: `User contacted: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            res.status(500).send({error: error});
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send({message: "Email sent"});
        }
    });
    
};

module.exports = {contactUs};