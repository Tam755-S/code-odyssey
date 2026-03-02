const User = require('../models/User');
const sendEmail = require('../utils/sendEmail'); // ✅ เรียกใช้ utils ตัวเดียวกับหน้า Verify

module.exports = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.render('forgot', { 
                error: "อีเมลนี้ยังไม่ได้ลงทะเบียนในระบบค่ะ", 
                email: email 
            });
        }

        // 1. สร้างรหัส Reset 6 หลัก
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. บันทึกลงฐานข้อมูล
        user.resetCode = resetCode;
        user.resetExpire = Date.now() + 10 * 60 * 1000; 
        await user.save();

        // 3. ✅ ส่งอีเมลโดยใช้ utils/sendEmail (ตัวที่ส่งรหัส Verify ได้)
        // หมายเหตุ: พี่ใส่หัวข้อเมลแยกให้ชัดเจน
        try {
            await sendEmail(email, resetCode); 
            console.log('✅ Reset Code Sent via utils/sendEmail to:', email);
        } catch (mailErr) {
            console.error('❌ Mail Utils Error:', mailErr);
            throw new Error("ระบบส่งอีเมลขัดข้อง");
        }

        // 4. ส่งไปหน้ากรอกรหัสใหม่
        res.redirect(`/reset?email=${encodeURIComponent(email)}`);

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.render('forgot', { 
            error: "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่ค่ะ", 
            email: req.body.email 
        });
    }
};