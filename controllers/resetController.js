const User = require('../models/User');
const bcrypt = require('bcrypt'); // ถ้าคุณเข้ารหัสผ่านตอนสมัคร ต้องใช้ตอนรีเซ็ตด้วย

module.exports = async (req, res) => {
    try {
        // ✅ รับค่าให้ตรงกับหน้า reset.ejs
        const { email, resetCode, newPassword } = req.body;

        // ค้นหา User ที่เมลตรงกัน และรหัสตรงกัน และรหัสยังไม่หมดอายุ ($gt = Greater Than)
        const user = await User.findOne({
            email: email,
            resetCode: resetCode,
            resetExpire: { $gt: Date.now() }
        });

        if (!user) {
            // ถ้าไม่เจอ ให้ส่งกลับหน้าเดิมพร้อม Error (เพื่อไม่ให้หน้าจอขาว)
            return res.render('reset', { 
                email, 
                error: "รหัสไม่ถูกต้อง หรืออาจหมดอายุแล้ว (5 นาที)" 
            });
        }

        // ✅ 1. เข้ารหัสรหัสผ่านใหม่ (สำคัญมาก: ถ้าตอน Register ใช้ bcrypt ตรงนี้ต้องใช้ด้วย)
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // 2. ล้างรหัสชั่วคราวออกเพื่อความปลอดภัย
        user.resetCode = null;
        user.resetExpire = null;

        await user.save();

        // 3. สำเร็จ! ส่งกลับไปหน้า Login เพื่อให้เขาลองเข้ารหัสใหม่
        res.redirect('/login');

    } catch (error) {
        console.error("Reset Error:", error);
        res.send("Internal Server Error"); // กรณีเกิดข้อผิดพลาดที่ระบบ
    }
};