const express = require("express");
const Router = express.Router();
const User = require("../model/users");

const {validationResult} = require('express-validator')
const loginValidator = require('./validator/loginValidator')
const registerValidator = require('./validator/registervalidator')
var nodemailer = require('nodemailer');
const checkLogin = require('../auth/checkLogin');
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const uploader = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => {

            if(req.session.user)
            {
                let emailUser = req.session.user.email
                let imagesUserPath = path.join(__dirname, `users/${emailUser}/images`)
                if(!fs.existsSync(imagesUserPath))
                {
                    fs.mkdirSync(imagesUserPath,{ recursive: true });
                }
                callback(null, imagesUserPath);
            }
            else
            {
                let emailRegister = req.body.email
                let imagesUserPath = path.join(__dirname, `users/${emailRegister    }/images`)
                if(!fs.existsSync(imagesUserPath))
                {
                    fs.mkdirSync(imagesUserPath,{ recursive: true });
                }
                callback(null, imagesUserPath);
            }
        }
    })
})

Router.use(express.static(path.join(__dirname, 'users')));


var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service: 'gmail',
        secure: false,
        requireTLS: false,
        port: 25,
        auth: {
        user: "binlatao10@gmail.com",
        pass: "01214243911",
    }
});



Router.put('/', checkLogin,(req, res) => {
    console.log(req.files)
})

Router.post('/', checkLogin,uploader.fields([{name:'idfrontChange'},{name:"idbacksideChange"}]),(req, res) => {
    let body = req.body
    let {idfrontChange,idbacksideChange} = req.files
    let user = req.session.user
    if(!user)
    {
        res.redirect('/login')
    }
    else
    {
        if(body.password)
        {
            User.findOne({email:user.email},(err,u) =>{
                if(u)
                {
                    User.updateOne({email:user.email},{password:body.password},function (err)
                    {
                        if (err) {
                            console.log(err)
                        }
                        else
                        {
                            User.updateOne({email:user.email},{firstLogin:false},function (err){
                                if (err) {
                                    console.log(err)
                                }
                            })
                        }
                    })
                }
            })
        }
        else if(body.newpassword)
        {
            User.findOne({email:user.email},(err,u) =>{
                if(u)
                {
                    User.updateOne({email:user.email},{password:body.newpassword},function (err)
                    {
                        if (err) {
                            console.log(err)
                        }
                    })
                }
            })
             res.redirect('/')
        }
        else if(req.files)
        {
            let newPathFront = path.join(__dirname, path.join(`users/${user.email}/images/${idfrontChange[0].originalname}`))
            let newPathBack = path.join(__dirname, path.join(`users/${user.email}/images/${idbacksideChange[0].originalname}`))

            let cmndfront = {
                path: newPathFront,
                name: path.basename(idfrontChange[0].originalname),
                imageType: idfrontChange[0].mimetype
            }
            let cmndback = {
                path: newPathBack,
                name: path.basename(idbacksideChange[0].originalname),
                imageType: idbacksideChange[0].mimetype
            }

            User.findOne({email:user.email},(err,u) =>{
                if(u)
                {
                    if(u.cmndfront.name !== cmndfront.name)
                    {
                        fs.unlinkSync(u.cmndfront.path)
                    }
                    if(u.cmndback.name !== cmndback.name)
                    {
                        fs.unlinkSync(u.cmndback.path)
                    }
                    fs.renameSync(idfrontChange[0].path,newPathFront)
                    fs.renameSync(idbacksideChange[0].path,newPathBack)
                    User.findOneAndUpdate({_id:user._id},{cmndfront:cmndfront,cmndback:cmndback},{new: true},(err,doc) =>{
                        if (err) {
                            console.log(err)
                        }
                        return res.redirect('/')
                    })
                }
            })
        }
    }
    
})

Router.get('/', checkLogin,(req, res) => {
    let body = req.body
    let infor = req.session.user
    let user = []
    User.findOne({email:infor.email},(err,u) =>{
        if(u)
        {
            user.push({
                id:u._id,
                fullname:u.fullname,
                username:u.username,
                email:u.email,
                phone:u.phone,
                birthday:u.birthday,
                address:u.address,
                cmndfront:u.cmndfront,
                cmndback:u.cmndback,
            })
        }
    })
    return res.render('user/detailinfo', {
        title: 'personal information', 
        currPage: '' ,
        layout: 'navUser', 
        user,
    })
})


Router.get('/firstLogin', function(req, res, next) {
    let user = req.session.user
    if(!user){
        res.redirect('/login')
    }else{
        User.findOne({email:user.email},(err,user) => {
            if(user)
            {
               if(user.firstLogin)
               {
                   res.json({
                       firstLogin:user.firstLogin
                   })
               }
            }
        })
    }
});


Router.get('/login', (req, res) => {
    if(req.session.user)
    {
        if(req.session.user.username == "admin")
        {
            return res.redirect('admin/waiting-activity');
        }
        return res.redirect('/');
    }
    const flash = req.flash("register_success");
    const error = req.flash('error') || ''
    const username = req.flash('username') || ''
    const password = req.flash('password') || ''
    return res.render('user/login',  {layout: 'main', error, username, password, flash})
})

Router.post('/login', loginValidator ,(req, res) => {
    let result = validationResult(req)
    let {username, password} = req.body
    if(result.errors.length === 0){
        User.findOne({username: username}, (err,user) => {
            if(user){
                if(username == "admin" && password === user.password){
                    req.session.user = user;
                    return res.redirect('/admin/waiting-activity')
                }
                if(password === user.password){
                    req.session.user = user;
                    return res.redirect('/')
                }else{
                    let message = 'Incorrect username or password'
                    req.flash('error',message)
                    req.flash('username',username)
                    return res.redirect('/login')
                }
            }else{
                let message = 'Incorrect username or password'
                req.flash('error',message)
                req.flash('username',username)
                return res.redirect('/login')
            }
        })
    }else{
        result = result.array()
        let message
        for(fields in result){
            message = result[fields].msg
            break
        }
    
        req.flash('error',message)
        req.flash('username',username)
        req.flash('password',password)
        return res.redirect('/login')
    }
})


Router.get('/register', (req, res) => {
    res.render('user/register', {layout: 'main'})
})

Router.post('/register',uploader.fields([{name:'idfront'},{name:"idbackside"}]),registerValidator, (req, res,next) => {
    let result = validationResult(req)
    if(result.errors.length === 0)
    {

        let {name,email,phone,birth,address} = req.body
        let {idfront,idbackside} = req.files
        let username = getRandomUsername();
        let password = getRandomPassword()

        var mailOptions = {
            from: 'Admin',
            to: email,
            subject: `Sending Account to ${name}`,
            html: `Your Username: <strong>${username}</strong> and Password: <strong>${password}</strong>`
        };

        let newPathFront = path.join(__dirname, path.join(`users/${email}/images/${idfront[0].originalname}`))
        let newPathBack = path.join(__dirname, path.join(`users/${email}/images/${idbackside[0].originalname}`))

        let user = new User({
            username:username,
            fullname:name,
            password:password,
            email:email,
            phone:phone,
            birthday:birth,
            address: address,
            cmndfront: {
                path: newPathFront,
                name: path.basename(idfront[0].originalname),
                imageType: idfront[0].mimetype
            },
            cmndback: {
                path: newPathBack,
                name: path.basename(idbackside[0].originalname),
                imageType: idbackside[0].mimetype
            },
            status:0,
            firstLogin:true,
        })
        user.save().then(() =>{
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    fs.renameSync(idfront[0].path,newPathFront)
                    fs.renameSync(idbackside[0].path,newPathBack)
                }
            });
            req.flash("register_success", "Tài khoản và mật khẩu được chuyển đã chuyển về gmail");
            return res.redirect('login')
        })
        .catch(e =>{
            return res.json({
                code:2,
                message:"Đăng ký thất bại " + e.message
            })
        })    
    }
    else
    {
        let messages = result.mapped()
        let message = ''
        for(m in messages)
        {
            message = messages[m].msg
            break
        }

        return res.json({
            code:1,
            message
        })
    }
})


Router.get('/password-recovery', (req, res) => {
    res.render('user/passwordrecovery', {layout: 'main'})
})

Router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})


function getRandomUsername() {
    var rand = (Math.floor(Math.random() * 10000000000) + 10000000000).toString().substring(1);
    return rand
}

function getRandomPassword() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

Router.get('/change-password', checkLogin,(req, res) => {
    console.log()
})

module.exports = Router
