const User = require('../models/User');

module.exports = async (req, res) => {
  try {
    const user = await User.create(req.body);

    console.log("ลงทะเบียนสำเร็จและบันทึกข้อมูลแล้ว");

    // ⭐ สำคัญที่สุด: ล็อกอินอัตโนมัติหลังสมัคร
    req.session.user = {
      _id: user._id,
      email: user.email,
      username: user.username
    };

    res.redirect('/main');

  } catch (error) {
    console.log("เกิดข้อผิดพลาดในการบันทึก:", error);

    // 1. อีเมลซ้ำ
    if (error.code === 11000) {
      req.flash('validationErrors', ['อีเมลนี้ถูกใช้ลงทะเบียนแล้ว']);
    }

    // 2. Validation error จาก mongoose
    else if (error.errors) {
      const validationErrors = Object.keys(error.errors).map(
        key => error.errors[key].message
      );
      req.flash('validationErrors', validationErrors);
    }

    req.flash('data', req.body);
    res.redirect('/register');
  }
};