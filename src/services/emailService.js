require('dotenv').config()
import nodemailer from 'nodemailer'
let sendSimpleEmail = async (dataSend) => {

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    // async..await is not allowed in global scope, must use a wrapper

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"NOThinkDontCare" <nothinkweb@gmail.com>', // sender address
        to: dataSend.reciverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh", // Subject line
        text: "Hello world?", // plain text body
        html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px;">
                    <h2 style="color: #2c3e50;">Xin chào ${dataSend.patientName},</h2>

                    <p>Bạn nhận được email này vì đã <strong>đặt lịch khám bệnh online</strong> qua hệ thống NOThinkDontCare.</p>

                    <h3>Thông tin đặt lịch khám bệnh:</h3>
                    <ul style="padding: 0;">
                        <li><strong>Họ tên:</strong> ${dataSend.patientName}</li>
                        <li><strong>Ngày sinh:</strong> ${dataSend.date}</li>
                        <li><strong>Giới tính:</strong> ${dataSend.patientGender}</li>
                        <li><strong>Số điện thoại:</strong> ${dataSend.patientPhoneNumber}</li>
                        <li><strong>Địa chỉ:</strong> ${dataSend.patientAddress}</li>
                        <li><strong>Lý do khám:</strong> ${dataSend.patientSeason}</li>
                        <li><strong>Thời gian khám:</strong> ${dataSend.time}</li>
                        <li><strong>Bác sĩ:</strong> ${dataSend.doctorName}</li>
                    </ul>

                    <p>Vui lòng <strong>click vào nút bên dưới</strong> để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh:</p>

                    <div style="text-align: center; margin: 20px 0;">
                        <a href=${dataSend.redirectLink} target="_blank" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Xác nhận lịch khám
                        </a>
                    </div>

                    <p>Nếu bạn không thực hiện thao tác này, vui lòng bỏ qua email.</p>

                    <p style="margin-top: 30px;">Trân trọng,<br/>Đội ngũ NOThinkDontCare</p>
                </div>
        `, // html body
    });


}
module.exports = {
    sendSimpleEmail
}