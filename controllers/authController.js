const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. ตรวจสอบว่ากรอกครบไหม
        if (!username || !email || !password) {
            return res.render('register', { errors: ['กรุณากรอกข้อมูลให้ครบถ้วน'] });
        }

        // 2. ตรวจสอบ Username ซ้ำ
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.render('register', { errors: ['Username นี้ถูกใช้ไปแล้ว กรุณาตั้งใหม่'] });
        }

        // 3. ตรวจสอบ Email ซ้ำ
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.render('register', { errors: ['Email นี้เคยสมัครสมาชิกแล้ว'] });
        }

        // 4. เข้ารหัส Password (สำคัญ!)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. สุ่มรหัส OTP 6 หลัก
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 6. บันทึกข้อมูลลง MongoDB
        await User.create({
            username,
            email,
            password: hashedPassword,
            isActivated: false,
            activationCode: otpCode,
            activationExpire: Date.now() + 5 * 60 * 1000 // หมดอายุใน 5 นาที
        });

        // 7. ส่งอีเมล (ถ้าส่งไม่ผ่านให้แจ้งเตือน)
        try {
            await sendEmail(email, otpCode);
        } catch (mailError) {
            console.error('Mail Error:', mailError);
            // ถ้าส่งเมลไม่สำเร็จ อาจจะลบ User ที่เพิ่งสร้างออกเพื่อให้เขาสมัครใหม่ได้
            await User.deleteOne({ email });
            return res.render('register', { errors: ['ไม่สามารถส่งอีเมลยืนยันได้ โปรดตรวจสอบอีเมลของคุณ'] });
        }

        // 8. เก็บ Email ใน Session เพื่อใช้หน้า Verify และเปลี่ยนหน้า
        req.session.verifyEmail = email;
        res.redirect('/verify');

    } catch (err) {
        console.error(err);
        res.render('register', { errors: ['เกิดข้อผิดพลาดในระบบ'] });
    }
};