const User = require('../models/User');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');

exports.showRegister = (req, res) => {
    res.render('register', { errors: [] });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const errors = [];


        // 2. ตรวจสอบ Username ซ้ำ
        const userExists = await User.findOne({ username: username });
        if (userExists) {
            return res.render('register', { errors: ['Username นี้ถูกใช้ไปแล้ว กรุณาตั้งใหม่'] });
        }

        // 3. ตรวจสอบ Email ซ้ำ (แยกเช็คชัดเจน)
        const emailExists = await User.findOne({ email: email });
        if (emailExists) {
            return res.render('register', { errors: ['อีเมลนี้เคยสมัครสมาชิกไปแล้ว'] });
        }

        // --- ถ้าผ่านการตรวจสอบด้านบนทั้งหมด ระบบจะมาทำตรงนี้ต่อ ---

        // 4. เข้ารหัส Password และสุ่มรหัส 6 หลัก
        const hashedPassword = await bcrypt.hash(password, 10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            username,
            email,
            password: hashedPassword,
            activationCode: code,
            activationExpire: Date.now() + 10 * 60 * 1000,
            isActivated: false
        });

        // 5. บันทึกข้อมูล
        await user.save();

        // 6. ส่งอีเมล (ใส่ try-catch แยกเฉพาะส่วนส่งเมล เพื่อความละเอียด)
        try {
            await sendEmail(email, code);
        } catch (mailErr) {
            console.error("Mail Error:", mailErr);
            // ถ้าส่งเมลไม่สำเร็จ อาจจะลบ user ที่สร้างตะกี้ออกเพื่อให้เขาสมัครใหม่ได้
            await User.deleteOne({ _id: user._id });
            return res.render('register', { errors: ['ไม่สามารถส่งอีเมลได้ โปรดเช็คความถูกต้องของอีเมล'] });
        }

        req.session.verifyEmail = email; 
        res.redirect('/verify');

    } catch (err) {
        console.error("System Error:", err);
        res.render('register', { errors: ['เกิดข้อผิดพลาดบางอย่างในระบบ'] });
    }
};