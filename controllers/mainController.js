const User = require('../models/User');
const shopData = require('../models/shopModel');
const specialQuestsData = require('../models/specialQuests');

module.exports = async (req, res) => {
    try {
        const isAuthenticated = !!req.session.userId;
        let user = null;
        let shouldStartTour = false;
        let npcList = [];

        if (isAuthenticated) {
            user = await User.findById(req.session.userId);

            if (user) {
                shouldStartTour = !user.tourCompleted;

                // ป้องกัน field หาย
                if (!user.specialQuestData) {
                    user.specialQuestData = { quests: [], metNPCs: [] };
                }

                if (!Array.isArray(user.specialQuestData.quests)) {
                    user.specialQuestData.quests = [];
                }

                const data = user.specialQuestData;

                // ================================
                // ⭐ สร้าง NPC List
                // ================================
                const allNPCs = [
                    { id: 1, name: 'P.Lily', avatar: '/NPC/friends/Lily.jpg', tag: 'Pa#12345' },
                    { id: 2, name: 'Noppakao', avatar: '/NPC/friends/noppakao.jpg', tag: 'No#67890' },
                    { id: 3, name: 'เจ้ดานิกา', avatar: '/NPC/friends/lady.jpg', tag: 'Da#11223' },
                    { id: 4, name: 'ลุงสันติ', avatar: '/NPC/friends/santi.jpg', tag: 'Sa#44556' },
                    { id: 5, name: 'Manager_D', avatar: '/NPC/friends/manager.jpg', tag: 'Ma#99887' }
                ];

                npcList = allNPCs.map(npc => {

    const questObj = data.quests.find(q => {
        const qData = specialQuestsData.find(
            sq => Number(sq.id) === Number(q.questId)
        );

        if (!qData) return false;

        return qData.npcName?.toLowerCase().trim() ===
               npc.name?.toLowerCase().trim();
    });

    const hasQuest = !!questObj;

    const qData = hasQuest
        ? specialQuestsData.find(
            q => Number(q.id) === Number(questObj.questId)
        )
        : null;

    let lastMsg = 'ขอบใจจ้า';

    if (hasQuest && qData) {
        if (questObj.status === 'accepted') {
            lastMsg = qData.messages.accept;
        } else if (questObj.status === 'offered') {
            lastMsg = qData.messages.offer;
        } else if (questObj.status === 'completed') {
            lastMsg = "งานเสร็จเรียบร้อย ขอบคุณมาก!";
        } else if (questObj.status === 'failed') {
            lastMsg = "งานล้มเหลว ไว้คราวหน้านะ";
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
        hasNotif: questObj?.hasNewMessage === true,
        lastMsg,
        timeText: hasQuest ? 'เมื่อสักครู่' : ''
    };
});
                
            }
        }

        res.render('main', {
            user,
            isAuthenticated,
            shouldStartTour,
            shopData,
            npcList,
            allNpcsJson: JSON.stringify(npcList)
        });

    } catch (error) {
        console.error("MAIN CONTROLLER CRASH:", error);
        res.status(500).send("Main Error: " + error.message);
    }
};