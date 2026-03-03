const nodemailer = require('nodemailer');

module.exports = async (to, code) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // รหัส 16 หลัก (ไม่มีช่องว่าง)
        },
        // เพิ่มเวลาให้เครื่อง Render ได้หายใจ ไม่ตัดการเชื่อมต่อเร็วเกินไป
        connectionTimeout: 20000, 
        greetingTimeout: 20000,
        socketTimeout: 20000
    });

    const mailOptions = {
        from: `"Quest Game Support" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'รหัสยืนยันการสมัครสมาชิก (OTP)',
        html: `
            <div style="font-family: sans-serif; text-align: center; border: 1px solid #ddd; padding: 20px;">
                <h2>ยืนยันบัญชีของคุณ</h2>
                <p>รหัสยืนยันตัวตนของคุณคือ:</p>
                <h1 style="color: #4A90E2; letter-spacing: 5px;">${code}</h1>
                <p>รหัสนี้จะหมดอายุภายใน 5 นาที</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};