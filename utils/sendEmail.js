const nodemailer = require('nodemailer');

module.exports = async (to, code) => {
    const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // ✅ ใช้ตัวนี้แหละค่ะ ถูกต้องแล้ว!
        port: 587,
        secure: false, // Outlook ใช้ false สำหรับ Port 587
        auth: {
            user: process.env.EMAIL_USER, // ต้องเป็นเมล @outlook ที่น้องสมัครใหม่
            pass: process.env.EMAIL_PASS  // รหัส 16 หลักของ Outlook (ไม่มีช่องว่าง)
        },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false // ช่วยให้ Render ส่งผ่านด่านป้องกันได้ง่ายขึ้น
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