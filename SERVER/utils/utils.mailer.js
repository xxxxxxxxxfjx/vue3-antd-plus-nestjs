const nodemailer = require("nodemailer");
/**
 * 邮箱发送
 *
 * @param  {string}  to 对方邮箱
 * @param  {string}  content 发送内容
 */

// 创建Nodemailer传输器 SMTP 或者 其他 运输机制
let transporter = nodemailer.createTransport(
    {
        service: 'QQ', // 使用内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
        port: 465, // SMTP 端口
        secureConnection: true, // 使用 SSL
        auth: {
            user: '1840354092@qq.com', // 发送方邮箱的账号
            pass: '******', // 邮箱授权密码
        }
    }
);

exports.send = (to, content) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail({
            from: `"ZY.Admin" <1840354092@qq.com>`, // 发送方邮箱的账号
            to: to, // 邮箱接受者的账号
            subject: "注册成功", // Subject line
            // text: '"MG'Blog 👻"', // 文本内容
            html: `
        <img src="http://www.zhouyi.run:3001/api/v1/files/preview?p=pexels-photo-276452.jpeg&&mimetype=image/jpeg" alt=""  style="height:auto;display:block;" />
        <p >🎉🎉🎉 <a href="http://www.zhouyi.run/#/">Welcome to ZY.Admin 👻</a></p>
        <p style="font-weight: bold">${content}</p>
        <p style="text-indent: 2em;">祝您工作顺利，心想事成</p>`
        }, (error, info) => {
            if (error) {
                reject(error)
            }
            resolve(info)
        });
    })
}
