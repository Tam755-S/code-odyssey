const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  isActivated: { type: Boolean, default: false },
  activationCode: String,
  activationExpire: Date,
  resetCode: { type: String, default: null },
  resetExpire: { type: Date, default: null },

  // ระบบเงินและการดำเนินงาน
  money: { type: Number, default: 200 },
  tourCompleted: { type: Boolean, default: false },

  // ✅ ส่วนสำหรับเก็บสถิติโปรไฟล์ (อาจารย์สั่งเพิ่ม)
  profileStats: {
    avatarUrl: { type: String, default: '/css/helper.PNG' }, 
    totalEarned: { type: Number, default: 0 }, // เงินสะสมทั้งหมดที่เคยได้
    totalSpent: { type: Number, default: 0 },  // เงินทั้งหมดที่เคยใช้
  },

  // --- ส่วนสำหรับระบบเควส ---
  activeQuests: [{ type: Number }],
  completedQuests: [{ type: Number }], 
  failedQuests: [{ type: Number }],    
  
  unlockedHints: { type: [Number], default: [] }, 

  questInProgress: {
    questId: { type: Number, default: null },
    tempCode: { type: String, default: "" }
  },

  inventory: {
    ownedIcons: { type: [String], default: [] },
    ownedWallpapers: { type: [String], default: [] },
    equipped: {
      helper: { type: String, default: '/css/helper.PNG' },
      learning: { type: String, default: '/css/book.PNG' },
      inbox: { type: String, default: '/css/inbox.PNG' },
      company: { type: String, default: '/css/company.PNG' },
      documents: { type: String, default: '/css/mistake.PNG' },
      wallpaper: { type: String, default: '/css/Main.png' } 
    }
  },

  // ✅ ส่วนสำหรับเก็บคะแนนทักษะตามประเภทเควส (สอดคล้องหลักสูตร สสวท.)
  skillStats: {
    typeA_Syntax: { type: Number, default: 0 },   // คะแนนทักษะการจำ/ไวยากรณ์ (Syntax)
    typeB_Logic: { type: Number, default: 0 },    // คะแนนทักษะตรรกะ (Logic)
    typeC_Math: { type: Number, default: 0 },     // คะแนนทักษะการคำนวณ (Math)
    
    // เก็บจำนวนข้อที่ทำสำเร็จแยกตามประเภท เพื่อหา "ความถนัด"
    completedA: { type: Number, default: 0 },
    completedB: { type: Number, default: 0 },
    completedC: { type: Number, default: 0 }
  }, 

  // --- COMPANY CHAT & SPECIAL QUESTS ---
specialQuestData: {
  quests: {
    type: [{
      questId: { type: Number, required: true },

      status: {
        type: String,
        enum: ['offered', 'accepted', 'completed', 'failed', 'rejected'],
        default: 'offered'
      },

      hasNewMessage: { type: Boolean, default: true },

      hintUnlocked: { type: Boolean, default: false },

      tempCode: { type: String, default: "" },

      startedAt: { type: Date, default: null }
    }],
    default: []
  },

  metNPCs: { type: [String], default: [] }
}

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);