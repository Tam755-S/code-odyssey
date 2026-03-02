const { spawn } = require("child_process");
const path = require("path");
const User = require('../models/User');
const { getAllQuests } = require("../public/js/quests");

// ==========================================
// 1. เปิดหน้า Editor
// ==========================================
exports.openEditor = (req, res) => {
    const questId = Number(req.params.id);
    const quest = getAllQuests().find(q => q.id === questId);
    if (!quest) return res.send("Quest not found");

    res.render("editor", { quest });
};

// ==========================================
// 2. รันโค้ด Python (สำหรับปุ่ม Run ทดสอบ)
// ==========================================
exports.runCode = (req, res) => {
    const python = spawn("python", [
        path.join(__dirname, "../runner/run.py")
    ], {
        env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    });

    const timer = setTimeout(() => {
        python.kill(); // สั่งหยุด Python ทันที
        if (!res.headersSent) {
            return res.json({ error: "🛑 Timeout: โค้ดทำงานนานเกินไป (อาจมี Infinite Loop)" });
        }
    }, 3000); 

    let output = "";
    let error = "";

    python.stdout.on("data", data => { 
        // ✅ ดักไว้ไม่ให้เก็บข้อมูลเกิน 100,000 ตัวอักษร (ประมาณ 100KB)
        if (output.length < 100000) {
            output += data.toString();
        } else if (!output.endsWith("\n... [Output Truncated]")) {
            output += "\n... [Output Truncated: ข้อมูลเยอะเกินไป ระบบตัดการรับเพื่อป้องกันเครื่องค้างจ้า]";
        }
    });
    python.stderr.on("data", data => { error += data.toString(); });

    python.on("close", () => {
        clearTimeout(timer); // ✅ สำคัญ: ถ้ารันเสร็จก่อน 3 วิ ให้ยกเลิกการจับเวลาจ้า

        if (res.headersSent) return;

        if (error) return res.json({ error });
        res.json({ output });
    });

    python.stdin.write(req.body.code);
    python.stdin.end();
};


// ==========================================
// 3. ตัดสินผลภารกิจ (สำหรับปุ่ม Submit)
// ==========================================
exports.submitCode = async (req, res) => {
    try {
        const { questId, code } = req.body;
        const userId = req.session.userId;
        const quest = getAllQuests().find(q => q.id === Number(questId));

        if (!quest) return res.status(404).json({ success: false, message: "ไม่พบเควสนี้" });

        // รันโค้ดจริงบน Server เพื่อดึง Output ที่ถูกต้องมาเทียบ
        const python = spawn("python", [path.join(__dirname, "../runner/run.py")], {
            env: { ...process.env, PYTHONIOENCODING: "utf-8" }
        });

        const timer = setTimeout(() => {
            python.kill();
            if (!res.headersSent) {
                res.json({ success: false, message: "🛑 ระบบตัดการทำงาน: โค้ดวนลูปนานเกินไป" });
            }
        }, 3000);

        let output = "";
        let error = "";

        python.stdout.on("data", data => { 
        // ✅ ดักไว้ไม่ให้เก็บข้อมูลเกิน 100,000 ตัวอักษร (ประมาณ 100KB)
        if (output.length < 100000) {
            output += data.toString();
        } else if (!output.endsWith("\n... [Output Truncated]")) {
            output += "\n... [Output Truncated: ข้อมูลเยอะเกินไป ระบบตัดการรับเพื่อป้องกันเครื่องค้างจ้า]";
        }
    });
        python.stderr.on("data", data => { error += data.toString(); });

        python.on("close", async () => {
            clearTimeout(timer); // ✅ อย่าลืมล้างตัวจับเวลาตรงนี้ด้วยนะจ๊ะ
            if (res.headersSent) return;
            if (error) {
                return res.json({ success: false, message: "โค้ดของคุณยังมีข้อผิดพลาด", debug: error });
            }

            const cleanActual = output.trim();
            const cleanExpected = String(quest.expectedOutput || "").trim();
            const isCorrect = (cleanActual === cleanExpected);

            if (isCorrect) {
                if (userId) {
                    // CASE: พนักงานที่ Login แล้ว
                    await User.findByIdAndUpdate(userId, {
                        $inc: { money: quest.reward },
                        $addToSet: { completedQuests: quest.id }, // ใช้ $addToSet ป้องกัน ID ซ้ำ
                        $pull: { activeQuests: quest.id, failedQuests: quest.id }
                    });
                } else {
                    // CASE: ผู้เข้าชม (Guest)
                    if (!req.session.guestData) {
                        req.session.guestData = { money: 200, activeQuests: [], completedQuests: [], failedQuests: [] };
                    }
                    let gd = req.session.guestData;
                    gd.money += quest.reward;
                    if (!gd.completedQuests.includes(quest.id)) gd.completedQuests.push(quest.id);
                    gd.failedQuests = gd.failedQuests.filter(id => id !== quest.id);
                    gd.activeQuests = gd.activeQuests.filter(id => id !== quest.id);
                    req.session.save();
                }
            } else {
                // กรณีตอบผิด ให้ย้ายไป failedQuests (ถ้าเป็น User ที่ Login)
                if (userId) {
                    await User.findByIdAndUpdate(userId, {
                        $addToSet: { failedQuests: quest.id },
                        $pull: { activeQuests: quest.id }
                    });
                }
            }

            // ส่งผลลัพธ์กลับไปที่หน้าจอ Client
            return res.json({ 
                success: isCorrect, 
                message: isCorrect 
                    ? `ภารกิจสำเร็จ! คุณได้รับ ${quest.reward} เหรียญ` 
                    : "คำตอบไม่ถูกต้อง ภารกิจถูกย้ายไปที่หน้า Documents แล้ว",
                explanation: isCorrect ? quest.explanation : null
            });
        });

        python.stdin.write(code);
        python.stdin.end();

    } catch (err) {
        console.error("Submit Error:", err);
        res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดภายในระบบ" });
    }
};