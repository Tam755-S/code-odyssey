const { getAllQuests } = require("../public/js/quests");
const User = require("../models/User");

/**
 * ✅ ฟังก์ชันสุ่มเควสใหม่ 
 */
async function refreshActiveQuests(user) {
    const allQuests = getAllQuests();
    
    // ป้องกันข้อมูลซ้ำใน Array
    user.activeQuests = [...new Set(user.activeQuests)];
    user.failedQuests = [...new Set(user.failedQuests)];
    user.completedQuests = [...new Set(user.completedQuests)];

    const active = user.activeQuests;
    const failed = user.failedQuests;
    const completed = user.completedQuests;

    // กรองเควสที่ยังไม่เคยทำ ยังไม่พัง และยังไม่ติดอยู่ในรายการ Active
    const availableQuests = allQuests.filter(q =>
        !active.includes(q.id) &&
        !completed.includes(q.id) &&
        !failed.includes(q.id)
    );

    // สุ่มเควสเติมให้ครบ 5 ช่อง
    while (active.length < 5 && availableQuests.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableQuests.length);
        const pickedQuest = availableQuests.splice(randomIndex, 1)[0];
        active.push(pickedQuest.id);
    }
    
    user.markModified('activeQuests');
}

// 📤 หน้า Inbox
module.exports.getQuests = async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    try {
        const user = await User.findById(req.session.userId);
        await refreshActiveQuests(user);
        await user.save();
        
        const allQuests = getAllQuests();
        const questsToShow = allQuests.filter(q => user.activeQuests.includes(q.id));
        res.render("Inbox", { quests: questsToShow, user });
    } catch (err) {
        console.error("Inbox Error:", err);
        res.redirect('/main');
    }
};

// 📤 หน้า Documents (ภารกิจที่พักไว้หรือทำผิด)
module.exports.getDocuments = async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    try {
        const user = await User.findById(req.session.userId);
        const allQuests = getAllQuests();

        // ✅ แก้ไข Filter: ให้โชว์เฉพาะข้อที่อยู่ใน failedQuests "แต่" ยังไม่อยู่ใน completedQuests
        const docsQuests = allQuests.filter(q => 
            user.failedQuests.includes(q.id) && !user.completedQuests.includes(q.id)
        );

        res.render("Documents", { quests: docsQuests, user });
    } catch (err) {
        console.error("Documents Error:", err);
        res.redirect('/main');
    }
};

// 📤 พักภารกิจ (ย้ายจาก Inbox ไป Documents)
module.exports.moveToDocument = async (req, res) => {
    const questId = Number(req.body.questId);
    if (!req.session.userId) return res.status(401).json({ success: false });
    try {
        const user = await User.findById(req.session.userId);
        user.activeQuests = user.activeQuests.filter(id => id !== questId);
        if (!user.failedQuests.includes(questId)) {
            user.failedQuests.push(questId);
        }
        user.markModified('activeQuests');
        user.markModified('failedQuests');
        await user.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// 📤 รายละเอียดภารกิจ
module.exports.getQuestDetail = async (req, res) => {
    const quest = getAllQuests().find(q => q.id === Number(req.params.id));
    res.render("QuestDetail", { quest });
};

// 📤 หน้า Editor สำหรับเขียนโค้ด
module.exports.getQuestEditor = async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    try {
        const user = await User.findById(req.session.userId);
        const questId = Number(req.params.id);
        const quest = getAllQuests().find(q => q.id === questId);
        if (!quest) return res.send("ไม่พบภารกิจนี้");

        const isHintUnlocked = user.unlockedHints && user.unlockedHints.includes(questId);
        res.render("editor", { 
            quest, 
            user, 
            isHintUnlocked: !!isHintUnlocked 
        });
    } catch (err) {
        res.redirect('/main');
    }
};

// 📤 ซื้อคำใบ้
module.exports.buyHint = async (req, res) => {
    const questId = Number(req.body.questId);
    const userId = req.session.userId;
    try {
        const user = await User.findById(userId);
        if (user.money < 50) return res.json({ success: false, message: "เงินไม่พอ!" });

        user.money -= 50;
        if (!user.profileStats) user.profileStats = { totalSpent: 0, totalEarned: 0 };
        user.profileStats.totalSpent += 50; 
        
        if (!user.unlockedHints.includes(questId)) {
            user.unlockedHints.push(questId);
        }
        user.markModified('unlockedHints');
        await user.save();

        const quest = getAllQuests().find(q => q.id === questId);
        res.json({ success: true, hint: quest.hint, currentMoney: user.money });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// 📤 ส่งภารกิจ (ตรวจคำตอบ + บันทึกสถิติทักษะลง skillStats)

module.exports.submitQuest = async (req, res) => {

    const { questId, actualOutput } = req.body;

    try {

        const user = await User.findById(req.session.userId);

        const questIdNum = Number(questId);

        const quest = getAllQuests().find(q => q.id === questIdNum);



        // 1. ตรวจสอบคำตอบ (Logic เดิมของน้องสาว)

        if (actualOutput === String(quest.expectedOutput).trim()) {

            

            // ✅ ส่วนที่เพิ่ม: บันทึกข้อมูล Type เควสลงใน skillStats (A, B, C)

            // เพื่อเอาไปดึงโชว์ที่หน้า Setting/Profile ภายหลัง

            if (quest.type === 'A') {

                user.skillStats.typeA_Syntax += 10; // เพิ่มคะแนน

                user.skillStats.completedA += 1;    // นับจำนวนข้อที่ทำถูก

            } else if (quest.type === 'B') {

                user.skillStats.typeB_Logic += 10;

                user.skillStats.completedB += 1;

            } else if (quest.type === 'C') {

                user.skillStats.typeC_Math += 10;

                user.skillStats.completedC += 1;

            }



            // 💰 จัดการระบบเงิน (เดิม)

            user.money += quest.reward;

            if (!user.profileStats) user.profileStats = { totalSpent: 0, totalEarned: 0 };

            user.profileStats.totalEarned += quest.reward; 

            

            // 📑 เก็บประวัติความสำเร็จ (เดิม)

            user.completedQuests.push(questIdNum);

            user.activeQuests = user.activeQuests.filter(id => id !== questIdNum);





            // 🎁 ระบบสะสมเควสพิเศษ (Logic เดิมของน้องสาวเป๊ะๆ ครบ 5 เด้ง 1)

            const completedCount = user.completedQuests.length;

            const shouldHaveSpecial = Math.floor(completedCount / 5);



            if (!user.specialQuestData) {

                user.specialQuestData = { quests: [], metNPCs: [] };

            }



            const npcGroups = [

                { name: 'P.Malika', quests: [101, 102] },

                { name: 'Noppakao', quests: [201, 202] },

                { name: 'เจ้ดานิกา', quests: [301, 302] },

                { name: 'ลุงสันติ', quests: [401, 402] },

                { name: 'Manager_D', quests: [501, 502] }

            ];



            while (user.specialQuestData.quests.length < shouldHaveSpecial) {

                const usedIds = user.specialQuestData.quests.map(q => q.questId);

                const eligibleNPCs = npcGroups.filter(group =>

                    !group.quests.some(id => usedIds.includes(id))

                );



                if (eligibleNPCs.length === 0) break;



                const selectedGroup = eligibleNPCs[Math.floor(Math.random() * eligibleNPCs.length)];

                const randomQuestId = selectedGroup.quests[Math.floor(Math.random() * selectedGroup.quests.length)];



                user.specialQuestData.quests.push({

                    questId: randomQuestId,

                    status: "offered",

                    hasNewMessage: true

                });

            }



            // 💾 บันทึกการเปลี่ยนแปลง (สำคัญ: ต้องมี markModified ของ skillStats ด้วย)

            user.markModified('skillStats'); 

            user.markModified('specialQuestData');

            user.markModified('activeQuests');

            user.markModified('failedQuests');

            user.markModified('completedQuests');



            await user.save();

            return res.json({ success: true, message: "คำตอบถูกต้อง ภารกิจสำเร็จ!", reward: quest.reward });



        } else {

            // ❌ กรณีคำตอบไม่ถูกต้อง (Logic เดิมของน้องสาว)

            user.activeQuests = user.activeQuests.filter(id => id !== questIdNum);

             {

                user.failedQuests.push(questIdNum);

            }

            user.markModified('activeQuests');

            user.markModified('failedQuests');

            await user.save();



            return res.json({ 

                success: false, 

                message: "คำตอบยังไม่ถูกต้อง ระบบได้ย้ายภารกิจนี้ไปที่ Documents แล้ว" 

            });

        }

    } catch (err) {

        console.error("Submit Error:", err);

        res.status(500).json({ success: false });

    }

};