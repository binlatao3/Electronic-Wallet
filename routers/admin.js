const express = require('express')
const Router = express.Router()
const checkLogin = require('../auth/checkLogin');
const checkAdminLogin = require('../auth/checkAdminLogin');

const {validationResult} = require('express-validator')
const loginValidator = require('./validator/loginValidator')
const User = require("../model/users");

Router.get('/waiting-activity',checkAdminLogin, (req, res) => {
    let admin = req.session.user
    let user =[]

    User.find({username:{$ne:admin.username}} ,(err,u) =>{
        if(u)
        {
            u.map(i=>{
                if(i.status === 0)
                {
                    user.push({
                        id:i._id,
                        fullname:i.fullname,
                        username:i.username,
                        email:i.email,
                        phone:i.phone,
                        birthday:i.birthday,
                        address:i.address,
                        cmndfront:i.cmndfront,
                        cmndback:i.cmndback,
                    })
                }
            })
        }
        else
        {
            console.log(err)
        }
    })
    res.render('admin/listwaitingactivity', {
        title: 'users list', 
        currPage: '• waiting activation' ,
        layout: 'navAdmin',
        user:user
    })
})

Router.get('/activated',checkAdminLogin, (req, res) => {
    let admin = req.session.user
    let user =[]
    User.find({username:{$ne:admin.username}} ,(err,u) =>{
        if(u)
        {
            u.map(i=>{
                if(i.status === 1)
                {
                    user.push({
                        id:i._id,
                        fullname:i.fullname,
                        username:i.username,
                        email:i.email,
                        phone:i.phone,
                        birthday:i.birthday,
                        address:i.address,
                        cmndfront:i.cmndfront,
                        cmndback:i.cmndback,
                    })
                }
            })
        }
        else
        {
            console.log(err)
        }
    })
    res.render('admin/listactivated', {
        title: 'users list', 
        currPage: '• activated' ,
        layout: 'navAdmin',
        user:user})
})

Router.get('/disabled',checkAdminLogin, (req, res) => {
    res.render('admin/listdisabled', {title: 'users list', currPage: '• disabled' ,layout: 'navAdmin'})
})

Router.get('/locked-indefinitely',checkAdminLogin, (req, res) => {
    res.render('admin/listlockedindefinitely', {title: 'users list', currPage: '• listlocked indefinitely' ,layout: 'navAdmin'})
})

Router.get('/transaction-approval',checkAdminLogin, (req, res) => {
    res.render('admin/listtransactionapproval', {title: 'transaction approval',currPage: '' ,layout: 'navAdmin'})
})

Router.get('/detail-user/:id',checkAdminLogin, (req, res) => {
    let id = req.params.id
    let user =[]
    User.findOne({_id:id},(err,u) =>{
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
            res.render('admin/detailuser', {
                title: 'detail user',
                currPage: '• Paul Melone' ,
                layout: 'navAdmin',
                user
            })
        }
    })
})

Router.post('/detail-user/:id',checkAdminLogin, (req, res) => {
    let id = req.params.id
    let body = req.body
    console.log(id)
    if(body.verification)
    {
        console.log(true)
        User.findOne({_id:id},(err,user) =>{
            if(user)
            {
                User.findByIdAndUpdate(user.id,{status:body.verification},(err,user)=>{
                    if(err)
                    {
                        console.log(err)
                    }
                })
            }
        })  

    }
    res.redirect('/admin/activated')
})

// Router.get('/login', (req, res) => {
//     if(req.session.admin)
//     {
//         return res.redirect('/admin/activated');
//     }
//     const error = req.flash('error') || ''
//     const username = req.flash('username') || ''
//     const password = req.flash('password') || ''
//     return res.render('admin/login',  {layout: 'main', error, username, password})
// })



// Router.post('/login', loginValidator ,(req, res) => {
//     let result = validationResult(req)
//     console.log(req.body)
//     let {username, password} = req.body
//     if(result.errors.length === 0){
//         Admin.findOne({username: "admin"}, (err,user) => {
//             if(user){
//                 if(username == user.username && password === user.password){
//                     req.session.admin = user;
//                     return res.redirect('/admin/activated')
//                 }else{
//                     let message = 'Incorrect username or password'
//                     req.flash('error',message)
//                     req.flash('username',username)
//                     return res.redirect('/admin/login')
//                 }
//             }else{
//                 let message = 'Incorrect username or password'
//                 req.flash('error',message)
//                 req.flash('useradmin',username)
//                 return res.redirect('/admin/login')
//             }
//         })
//     }else{
//         result = result.array()
//         let message
//         for(fields in result){
//             message = result[fields].msg
//             break
//         }

//         req.flash('error',message)
//         req.flash('username',username)
//         req.flash('password',password)
//         return res.redirect('/admin/login')
//     }
// })
module.exports = Router