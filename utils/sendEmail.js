const nodemailer = require('nodemailer');

module.exports = async (to, code) => {
    console.log("--------------------------------------------------");
    console.log("🚀 [DEBUG] เริ่มต้นกระบวนการส่งอีเมล...");
    console.log(`📧 ผู้รับ: ${to}`);
    console.log(`📧 ผู้ส่ง (Config): ${process.env.EMAIL_USER}`);

    // ตรวจสอบว่ามีค่าใน Environment หรือไม่
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ [ERROR] ตรวจพบค่าว่างใน EMAIL_USER หรือ EMAIL_PASS!");
        throw new Error("Email configuration is missing");
    }

    const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587, // พี่เปลี่ยนกลับเป็น 587 นะคะ เพราะปกติ Outlook ใช้คู่กับ secure: false
        secure: false, 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        },
        connectionTimeout: 10000, // กำหนดให้ขาดการเชื่อมต่อใน 10 วินาที (ไม่ต้องรอนาน)
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

    try {
        console.log("⏳ [Step 3] กำลังพยายามเชื่อมต่อกับ SMTP Server...");
        
        // ทดสอบการเชื่อมต่อก่อนส่งจริง
        await transporter.verify();
        console.log("✅ [Step 4] เชื่อมต่อสำเร็จ! (SMTP Verify Passed)");

        console.log("📨 [Step 5] กำลังส่งอีเมล...");
        const info = await transporter.sendMail(mailOptions);
        
        console.log("🎉 [Step 6] ส่งสำเร็จแล้ว!");
        console.log("🆔 Message ID:", info.messageId);
        console.log("--------------------------------------------------");
        return info;

    } catch (error) {
        console.error("❌ [FATAL ERROR] การส่งเมลล้มเหลว!");
        console.error("- Error Name:", error.name);
        console.error("- Error Code:", error.code);     // เช่น ETIMEDOUT
        console.error("- Error Command:", error.command); // เช่น CONN
        console.error("- Stack Trace:", error.stack);
        console.log("--------------------------------------------------");
        throw error;
    }
};