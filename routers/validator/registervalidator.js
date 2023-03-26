const {check } = require('express-validator');
const User = require('../../model/users')
const registervalidator = [
    check('name').exists().withMessage('Vui lòng nhập tên người dùng')
    .notEmpty().withMessage('Không được để trống tên người dùng'),

    check('email').exists().withMessage('Vui lòng nhập email người dùng')
    .notEmpty().withMessage('Không được để trống email người dùng')
    .isEmail().withMessage('Email không hợp lệ')
    .custom(async (email) =>{
        await User.findOne({email:email})
        .then(user =>{
            if(user)
            {
                throw new Error("Email đã tồn tại")
            }
        })
    }),
    
    check('phone').exists().withMessage('Vui lòng nhập số điện thoại')
    .notEmpty().withMessage('Không được để trống số điện thoại'),

    check('birth').exists().withMessage('Vui lòng nhập ngày sinh')
    .notEmpty().withMessage('Không được để trống số ngày sinh')
    .matches(/^(\d{4})-0?(\d+)-0?(\d+)[T ]0?(\d+):0?(\d+):0?(\d+)$/).withMessage('Ngày sinh không hợp lệ'),

    check('address').exists().withMessage('Vui lòng nhập địa chỉ')
    .notEmpty().withMessage('Không được để trống địa chỉ'),

    check('idfront')
    .custom((value,{req,next}) =>{
        var imgFront = req.files.idfront
        if(imgFront)
        {
            return true;
        }
        else
        {
            return false
        }
    }).withMessage("Không được để trống CMND/CCCD mặt trước"),
        
    check('idbackside')
    .custom((value,{req,next}) =>{
        var imgBack = req.files.idbackside
        if(imgBack)
        {
            return true;
        }
        else
        {
            return false
        }
    }).withMessage("Không được để trống CMND/CCCD mặt sau"),
]

module.exports = registervalidator