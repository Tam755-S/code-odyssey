const nodemailer = require('nodemailer');

module.exports = async (to, code) => {
    const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // ใช้ false สำหรับ port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // ช่วยให้ส่งผ่าน Server Cloud ได้ง่ายขึ้น
    }
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