const User = require('../models/User'); // นำเข้า Model สำหรับจัดการฐานข้อมูลผู้ใช้
const specialQuests = require('../models/specialQuests'); // ตรวจสอบ path ของไฟล์ข้อมูลเควสด้วยนะคะ
const { spawn } = require('child_process');
const path = require('path');

exports.checkAnswer = async (req, res) => {
    try {
        const { questId, code, isTimeout } = req.body; // รับค่า isTimeout เพิ่มจากหน้าบ้าน
        const questIdNum = Number(questId);
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(401).json({ success: false });

        const quest = specialQuests.find(q => q.id === questIdNum);
        if (!quest) return res.json({ success: false, message: "ไม่พบเควสพิเศษนี้" });

        const questObj = user.specialQuestData?.quests?.find(q => Number(q.questId) === questIdNum);

        // ⏰ 1. กรณีเวลาหมด (Timeout)
        if (isTimeout) {
            if (questObj) questObj.status = "failed"; // เปลี่ยนสถานะเป็นพลาด
            user.markModified("specialQuestData");
            await user.save();
            return res.json({ 
                success: false, 
                message: "เสียใจด้วย คุณทำไม่ทัน เวลาหมดแล้ว!", 
                redirectTo: "/main" // ส่งคำสั่งให้หน้าบ้านย้ายไปหน้าเมนู
            });
        }

        const runnerPath = path.join(__dirname, "../runner/run.py");
        const py = spawn("python", [runnerPath], { 
            env: { ...process.env, PYTHONIOENCODING: "utf-8" }
        });

        // 🔥 เพิ่มตรงนี้: ตัวฆ่าลูป (Timeout หลังบ้าน 3 วินาที)
        // ป้องกันกรณีผู้เล่นเขียน while True: ในเควสพิเศษจ้า
        const timer = setTimeout(() => {
            py.kill(); // สั่งหยุด Python ทันที
            if (!res.headersSent) {
                return res.json({ 
                    success: false, 
                    message: "🛑 โค้ดวนลูปนานเกินไป (3 วินาที) ระบบตัดการทำงานอัตโนมัติจ้า",
                    redirectTo: "/main"
                });
            }
        }, 3000); 

        let output = "";
        let errorOutput = "";
        
        py.stdin.write(code); 
        py.stdin.end();

        py.stdout.on("data", data => { 
            // ✅ ดักไว้เหมือนกันจ้า เพื่อความปลอดภัย
            if (output.length < 100000) {
                output += data.toString();
            } else if (!output.endsWith("\n... [Output Truncated]")) {
                output += "\n... [Output Truncated]";
            }
        });
        py.stderr.on("data", (data) => { errorOutput += data.toString(); });

        py.on("close", async () => {
            clearTimeout(timer); // ✅ อย่าลืมล้างตัวจับเวลาเมื่อรันเสร็จนะจ๊ะ!

            if (res.headersSent) return; // ถ้าส่ง Response ไปแล้ว (จาก Timeout) ให้หยุดทำงานส่วนนี้

            const userResult = output.trim();
            const expected = String(quest.expectedOutput || "").trim();

            if (!errorOutput && userResult === expected) {
                // ✅ 2. กรณีตอบถูก (ได้โบนัส 1,000)
                const bonusReward = 1000; 
                user.money += bonusReward;
                
                if (!user.profileStats) user.profileStats = { totalSpent: 0, totalEarned: 0 };
                user.profileStats.totalEarned += bonusReward;

                // อัปเดตสถิติเหมือนเควสปกติ
                if (quest.type === 'A') user.skillStats.completedA += 1;
                else if (quest.type === 'B') user.skillStats.completedB += 1;
                else if (quest.type === 'C') user.skillStats.completedC += 1;

                if (questObj) questObj.status = "completed";
                if (!user.completedQuests.includes(questIdNum)) {
                    user.completedQuests.push(questIdNum);
                }

                user.markModified("specialQuestData");
                user.markModified("skillStats");
                user.markModified("completedQuests");
                await user.save();
                
                return res.json({ 
                    success: true, 
                    message: "ยินดีด้วย! คุณตอบถูกต้องและได้รับรางวัลโบนัส 1,000 เหรียญ",
                    reward: bonusReward,
                    redirectTo: "/main"
                });

            } else {
                // ❌ 3. กรณีตอบผิด (ไม่ได้รางวัล)
                if (questObj) questObj.status = "failed"; // ปิดโอกาสทำซ้ำตามกติกาเควสพิเศษ
                
                user.failedQuests.push(questIdNum);
                user.markModified("failedQuests");
                user.markModified("specialQuestData");
                await user.save();

                return res.json({ 
                    success: false, 
                    message: "คำตอบผิด! คุณไม่ได้รับรางวัลโบนัสในครั้งนี้",
                    redirectTo: "/main"
                });
            }
        });
    } catch (err) {
        console.error("Special Quest Error:", err);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการส่งคำตอบ" });
    }
};
// ===============================

// 2. ซื้อคำใบ้ 50 เหรียญ

// ===============================

exports.buyHint = async (req, res) => {

    try {

        const user = await User.findById(req.session.userId);

        if (!user) return res.status(401).json({ success: false });



        const questId = Number(req.body.questId);

        const quest = specialQuests.find(q => q.id === questId);



        if (!quest) return res.json({ success: false, message: "ไม่พบข้อมูลเควส" });



        // ✅ ตรวจสอบ ID ในอาเรย์รวม unlockedHints (ตัวเดียวกับเควสปกติ)

        if (user.unlockedHints && user.unlockedHints.includes(questId)) {

            return res.json({

                success: true,

                hintText: quest.hint,

                newBalance: user.money,

                alreadyUnlocked: true // แจ้งหน้าบ้านว่าไม่ต้องหักเงินซ้ำ

            });

        }



        if (user.money < 50) {

            return res.json({ success: false, message: "เงินไม่เพียงพอสำหรับการซื้อคำใบ้" });

        }



        // 💰 หักเงิน

        user.money -= 50;



        // ✅ บันทึกลง unlockedHints ตัวเดียวกับที่เควสปกติใช้

        if (!user.unlockedHints) user.unlockedHints = [];

        user.unlockedHints.push(questId);



        if (user.profileStats) {

            user.profileStats.totalSpent = (user.profileStats.totalSpent || 0) + 50;

        }



        await user.save();



        return res.json({

            success: true,

            hintText: quest.hint,

            newBalance: user.money

        });



    } catch (err) {

        console.error("Buy Hint Error:", err);

        res.status(500).json({ success: false });

    }

};