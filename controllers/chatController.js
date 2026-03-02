const User = require('../models/User');
const specialQuestsData = require('../models/specialQuests');

// 1. แสดงรายการแชททั้งหมด
exports.getChatList = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.redirect('/login');

        if (!user.specialQuestData) {
            user.specialQuestData = { quests: [], metNPCs: [] };
        }

        if (!user.specialQuestData.quests) {
            user.specialQuestData.quests = [];
        }

        const allNPCs = [
            { id: 1, name: 'P.Lily', avatar: '/NPC/friends/Lily.jpg', tag: 'Pa#12345' },
            { id: 2, name: 'Noppakao', avatar: '/NPC/friends/noppakao.jpg', tag: 'No#67890' },
            { id: 3, name: 'เจ้ดานิกา', avatar: '/NPC/friends/lady.jpg', tag: 'Da#11223' },
            { id: 4, name: 'ลุงสันติ', avatar: '/NPC/friends/santi.jpg', tag: 'Sa#44556' },
            { id: 5, name: 'Manager_D', avatar: '/NPC/friends/manager.jpg', tag: 'Ma#99887' }
        ];

        const npcList = allNPCs.map(npc => {
            // หาว่า NPC คนนี้มีเควสผูกอยู่กับ User ไหม
            const questObj = user.specialQuestData.quests.find(q => {
                const questData = specialQuestsData.find(
                    sq => Number(sq.id) === Number(q.questId)
                );
                return questData && questData.npcName === npc.name;
            });

            const hasQuest = !!questObj;
            let qData = null;
            if (hasQuest) {
                qData = specialQuestsData.find(
                    q => Number(q.id) === Number(questObj.questId)
                );
            }

            // --- กำหนดข้อความล่าสุดตามสถานะ ---
            let lastMsg = 'สวัสดีจ้า มีอะไรให้ช่วยไหม?'; // ข้อความ Default

            if (hasQuest && qData) {
                // ✅ เรียงลำดับให้ชัดเจน: เช็คสถานะ Rejected ก่อนเงื่อนไขอื่น
                if (questObj.status === 'rejected') {
                    lastMsg = qData.messages.reject || "เสียดายจัง ไว้โอกาสหน้านะ";
                } 
                else if (questObj.status === 'completed') {
                    lastMsg = "งานเสร็จเรียบร้อย ขอบใจมากนะ!";
                } 
                else if (questObj.status === 'failed') {
                    lastMsg = "งานล้มเหลวไปซะแล้ว ไว้คราวหน้านะ";
                } 
                else if (questObj.status === 'accepted') {
                    lastMsg = qData.messages.accept;
                } 
                else if (questObj.status === 'offered') {
                    lastMsg = qData.messages.offer;
                }
            }

            return {
                id: npc.id,
                npcName: npc.name,
                npcTag: npc.tag,
                avatar: npc.avatar,
                hasQuest,
                questId: questObj?.questId || null,
                npcChatStatus: questObj?.status || null,
                hasNotif: questObj ? (questObj.status === 'offered' || questObj.status === 'accepted') : false,
                lastMsg
            };
        });

        res.render('main', {
            user,
            npcList,
            allNpcsJson: JSON.stringify(npcList)
        });

    } catch (err) {
        console.error("ChatList Error:", err);
        res.status(500).send("Chat Error");
    }
};

// 2. กดยอมรับภารกิจ
exports.acceptQuest = async (req, res) => {
    try {
        const { questId } = req.body;
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(401).json({ success: false });

        if (!user.specialQuestData || !user.specialQuestData.quests) {
            return res.json({ success: false });
        }

        const quest = user.specialQuestData.quests.find(q => q.questId == questId);
        if (!quest) return res.json({ success: false });

        quest.status = 'accepted';
        quest.hasNewMessage = false;
        quest.startedAt = new Date();

        user.markModified('specialQuestData');
        await user.save();

        const questData = specialQuestsData.find(q => q.id == questId);

        res.json({
            success: true,
            message: questData?.messages.accept || "รับงานแล้ว"
        });

    } catch (err) {
        console.error("ACCEPT ERROR:", err);
        res.status(500).json({ success: false });
    }
};

// 3. กดปฏิเสธภารกิจ (ห้ามลบทิ้ง ให้บันทึกเป็น Rejected)
exports.rejectQuest = async (req, res) => {
    try {
        const { questId } = req.body;
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(401).json({ success: false });

        if (!user.specialQuestData || !user.specialQuestData.quests) {
            return res.json({ success: false });
        }

        // ✅ แก้ไข: เปลี่ยนจาก .filter (ลบทิ้ง) เป็นการหาแล้วเปลี่ยน status
        const quest = user.specialQuestData.quests.find(q => q.questId == questId);
        
        if (quest) {
            quest.status = 'rejected';
            quest.hasNewMessage = false;
        }

        user.markModified('specialQuestData');
        await user.save();

        // ดึงข้อมูลคำพูด Reject ของ NPC คนนั้นกลับไปแสดงที่หน้าแชท
        const questData = specialQuestsData.find(q => q.id == questId);

        res.json({ 
            success: true,
            message: questData?.messages.reject || "รับทราบจ้า"
        });

    } catch (err) {
        console.error("REJECT ERROR:", err);
        res.status(500).json({ success: false });
    }
};

// 4. ยกเลิกหรือทำภารกิจไม่ทัน (Failed)
exports.cancelQuest = async (req, res) => {
    try {
        if (!req.body || !req.body.questId) {
            return res.json({ success: false, message: "ไม่มี questId ส่งมา" });
        }

        const questId = Number(req.body.questId);
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(401).json({ success: false });

        if (!user.specialQuestData || !user.specialQuestData.quests) {
            return res.json({ success: false });
        }

        const quest = user.specialQuestData.quests.find(q => q.questId == questId);
        if (!quest) return res.json({ success: false });

        quest.status = 'failed';

        user.markModified('specialQuestData');
        await user.save();

        res.json({ success: true });

    } catch (err) {
        console.error("CANCEL ERROR:", err);
        res.status(500).json({ success: false });
    }
};