const User = require("../models/User");
const { getAllQuests } = require("../public/js/quests"); // ✅ ดึงข้อมูลเควสมาเพื่อแยกประเภท A, B, C

// ---------------------------------------------------------
// 1. แสดงหน้า Settings (วิเคราะห์สถิติแยกประเภทแบบละเอียด)
// ---------------------------------------------------------
exports.showSettings = async (req, res) => {
    const isLoggedIn = !!req.session.userId;
    
    try {
        let userData = null;
        
        // ✅ เตรียมก้อนข้อมูลสถิติแยกประเภท (สำหรับนับสดๆ จาก Array)
        let stats = {
            A: { ok: 0, fail: 0 },
            B: { ok: 0, fail: 0 },
            C: { ok: 0, fail: 0 }
        };

        if (isLoggedIn) {
            userData = await User.findById(req.session.userId);
            
            if (userData) {
                const allQuests = getAllQuests();

                // 1. นับข้อที่ "ถูก" แยกตามประเภท (ดึงจาก completedQuests)
                if (userData.completedQuests) {
                    userData.completedQuests.forEach(id => {
                        const q = allQuests.find(quest => quest.id === id);
                        if (q && stats[q.type]) stats[q.type].ok++;
                    });
                }

                // 2. นับข้อที่ "ผิด" แยกตามประเภท (ดึงจาก failedQuests)
                if (userData.failedQuests) {
                    userData.failedQuests.forEach(id => {
                        const q = allQuests.find(quest => quest.id === id);
                        if (q && stats[q.type]) stats[q.type].fail++;
                    });
                }

                // ตรวจสอบโครงสร้าง skillStats ป้องกัน Error หน้าบ้าน
                if (!userData.skillStats) {
                    userData.skillStats = { completedA: 0, completedB: 0, completedC: 0 };
                }
            }
        }

        // 📤 ส่งค่าทั้งหมดไปที่หน้า settings.ejs
        res.render('settings', {
            userVolume: 50,
            isLoggedIn,
            user: userData,
            stats, // ✅ ส่งข้อมูลสถิติแยก A, B, C ไปคำนวณ % ที่หน้าบ้าน
            totalCorrect: userData ? (userData.completedQuests?.length || 0) : 0,
            totalWrong: userData ? (userData.failedQuests?.length || 0) : 0
        });
    } catch (err) {
        console.error("Settings Error:", err);
        res.redirect('/main');
    }
};

// ---------------------------------------------------------
// 2. อัปเดตรูปโปรไฟล์ (บันทึกรูป Base64 ลง MongoDB 直接)
// ---------------------------------------------------------
exports.updateAvatar = async (req, res) => {
    try {
        const { avatarData } = req.body; // รับ String รูปภาพจากหน้าบ้าน
        
        if (!req.session.userId) return res.status(401).json({ success: false });
        if (!avatarData) return res.json({ success: false, message: "ไม่พบข้อมูลรูปภาพค่ะ" });

        const user = await User.findById(req.session.userId);
        if (!user) return res.json({ success: false, message: "ไม่พบผู้ใช้งาน" });

        if (!user.profileStats) user.profileStats = {};
        
        // ✅ บันทึกข้อความรูปภาพ (Base64) ลง MongoDB เลย ไม่ต้องเก็บเป็นไฟล์
        user.profileStats.avatarUrl = avatarData;

        user.markModified('profileStats'); 
        await user.save();

        res.json({ 
            success: true, 
            avatarUrl: avatarData,
            message: "บันทึกรูปลงฐานข้อมูลเรียบร้อยแล้วค่ะ!" 
        });

    } catch (err) {
        console.error("Update Avatar Error:", err);
        res.status(500).json({ success: false });
    }
};