// controllers/tourController.js
const User = require('../models/User');

// ฟังก์ชันสำหรับแสดงหน้าหลัก
exports.showMainPage = async (req, res) => {
    const isAuthenticated = !!req.session.userId;
    let shouldStartTour = true;

    if (isAuthenticated) {
        try {
            const user = await User.findById(req.session.userId);
            // ✅ แก้เป็น tourCompleted ให้ตรงกับ Schema ใน User.js
            shouldStartTour = user ? !user.tourCompleted : true;
        } catch (error) {
            console.error("Error:", error);
        }
    } else {
        // Guest ให้เห็นทุกครั้ง
        shouldStartTour = true;
    }

    res.render('main', {
        isAuthenticated,
        shouldStartTour
    });
};
