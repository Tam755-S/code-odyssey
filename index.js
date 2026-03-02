require('dotenv').config();
const express = require('express')
const app = express()
const ejs = require('ejs')
const mongoose = require('mongoose')
const expressSession = require('express-session')
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash')
const path = require('path');
const User = require('./models/User');
const multer = require('multer');
const fs = require('fs');

//mongoconnec

// 2. แก้ไขส่วนการเชื่อมต่อฐานข้อมูลเป็นแบบนี้จ้า
const dbUrl = process.env.MONGO_URI; 

mongoose.connect(dbUrl)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(err => {
        console.log("❌ MongoDB connection error:");
        console.log(err);
    });


// Controllers
const indexController = require('./controllers/indexController')
const loginController = require('./controllers/loginController')
const registerController = require('./controllers/registerController');
const storeUserController = require('./controllers/storeUserController')
const loginUserController = require('./controllers/loginUserController')
const mainController = require('./controllers/mainController')
const helperController = require('./controllers/helperController')
const learningController = require('./controllers/learningController')
const tourController = require('./controllers/tourController')
const finishTourController = require('./controllers/finishTourController')
const questsController = require('./controllers/questsController')
const editorController = require('./controllers/editorController');
const runController = require("./controllers/runController");
const settingsController = require('./controllers/settingsController')
const authController = require('./controllers/authController');
const forgotController = require('./controllers/forgotController');
const resetController = require('./controllers/resetController');
const verifyController = require('./controllers/verifyController');
const shopController = require('./controllers/shopController');
const chatController = require('./controllers/chatController');
const specialQuests = require('./models/specialQuests');
const specialQuestController = require('./controllers/specialQuestController');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './public/uploads/avatars';
        // สร้างโฟลเดอร์อัตโนมัติถ้ายังไม่มี
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์: avatar-userid-timestamp.jpg
        cb(null, `avatar-${req.session.userId}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// --- Middleware ---
app.use(expressSession({
    secret: process.env.SESSION_SECRET || "node secret",
    resave: false,             // ✅ เปลี่ยนเป็น false เพื่อประสิทธิภาพที่ดีขึ้น
    saveUninitialized: false,  // ✅ ไม่สร้าง Session เปล่าถ้ายังไม่ล็อกอิน
    store: MongoStore.create({
        mongoUrl: dbUrl,       // ✅ ใช้ URL เดียวกับที่ต่อ Database
        ttl: 24 * 60 * 60      // เก็บ Session ไว้ 24 ชั่วโมง
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // อายุ Cookie 1 วัน
        httpOnly: true 
    }
}));

app.use(express.static('public'))
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use(flash())
app.set('view engine', 'ejs')

app.use((req, res, next) => {
  res.locals.user = req.session.userId || null;
  res.locals.guestData = req.session.guestData || null;
  next();
});


// --- หน้าทั่วไป ---
app.get('/', indexController);
// Route สำหรับเริ่มเกมใหม่ของ Guest (ล้างข้อมูลเก่าทิ้ง)
app.get('/start-guest', (req, res) => {
    // ล้างค่าใน session ทันที
    req.session.guestData = null;
    req.session.tourCompleted = false;
    
    // บันทึกและส่งไปหน้า main พร้อมแนบ ?reset=true
    req.session.save(() => {
        res.redirect('/main?reset=true');
    });
});
app.get('/main', mainController);
app.get('/helper', helperController);
app.get('/learning', learningController);
app.get('/settings', settingsController.showSettings);
app.post('/user/update-avatar', settingsController.updateAvatar);

// --- ระบบสมัครสมาชิก & ยืนยันตัวตน (จัดกลุ่มใหม่ตามที่คุณต้องการ) ---
app.get('/register', registerController.showRegister);
app.post('/user/register', registerController.register); 

app.get('/verify', verifyController.showVerify);
app.post('/user/verify', verifyController.verify);
app.post('/user/resend-code', verifyController.resend); // ปุ่มขอ Recode

// --- ระบบล็อคอิน & ล็อคเอาท์ ---
app.get('/login', loginController);
app.post('/user/login', loginUserController.login);
app.post('/user/logout', loginUserController.logout);

// --- ระบบลืมรหัสผ่าน ---
app.get('/forgot-password', (req, res) => res.render('forgot', { error: null }));
app.post('/user/forgot', forgotController);
app.get('/reset', (req, res) => res.render('reset', { email: req.query.email, error: null }));
app.post('/user/reset', resetController);

// --- ระบบเควส & ทัวร์ไกด์ & Editor ---
app.get('/tour', tourController.showMainPage);
app.post('/user/finish-tour', finishTourController.finishTour);
app.get('/Inbox', questsController.getQuests);

// 📬 หน้ารายการเควส
app.get('/Inbox', questsController.getQuests);
app.get('/Documents', questsController.getDocuments);
app.get('/quests/:id', questsController.getQuestDetail);

// 💻 เส้นทางเข้าหน้า Editor (สำคัญ: ทุกทางต้องวิ่งไปหา questsController.getQuestEditor)
// พี่สาวลบ editorController.openEditor ออก เพราะตัวนั้นทำให้คำใบ้ต้องซื้อซ้ำจ้า
app.get('/editor/:id', questsController.getQuestEditor); 
app.get('/Documents/:id', questsController.getQuestEditor); 
app.get('/quests/:id/editor', questsController.getQuestEditor); 


// ⚙️ ระบบการทำงานใน Editor
app.post('/editor/run', editorController.runCode);
app.post('/editor/submit', questsController.submitQuest); // ✅ เปลี่ยนจาก editorController เป็น questsController เพื่อสะสมเลข 1,2,3
app.post('/quests/buy-hint', questsController.buyHint);
app.post('/quests/move-to-document', questsController.moveToDocument);
app.post('/special-quest/cancel', chatController.cancelQuest);
app.post('/special-quest/check', specialQuestController.checkAnswer);
app.post('/special-quest/buy-hint', specialQuestController.buyHint);
app.post('/special-quest/cancel', chatController.cancelQuest);

// --- เส้นทาง API (กันเหนียว) ---
app.post("/api/run", runController.runPython);
app.post('/api/submit', questsController.submitQuest); // ✅ เปลี่ยนให้ตรงกันจ้า

// หน้าแสดงรายการสินค้าในร้านค้า
app.get('/shop', shopController.showShop);

// Route สำหรับกดซื้อไอเทม (หักเงิน และเพิ่มเข้าคลัง)
app.post('/shop/buy', shopController.buyItem);

// Route สำหรับติดตั้งไอเทมลงใน Slot ที่เลือก (เช่น เปลี่ยนรูปไอคอน Inbox)
app.post('/shop/equip', shopController.equipItem);

app.get('/company-chat', chatController.getChatList);
// 2. เมื่อผู้เล่นกด "ตกลง" รับเควสพิเศษ
app.post('/special-quest/accept', chatController.acceptQuest);

// 3. เมื่อผู้เล่นกด "ปฏิเสธ" เควสพิเศษ
app.post('/special-quest/reject', chatController.rejectQuest);

app.get('/editor/special/:id', async (req, res) => {
    try {
        const questId = parseInt(req.params.id);
        const quest = specialQuests.find(q => q.id === questId);

        if (!quest) {
            return res.status(404).send("ไม่พบภารกิจด่วน ID นี้ในระบบจ้า");
        }

        let currentUser = null;
        if (req.session.userId) {
            // ดึงข้อมูล User จากฐานข้อมูล
            currentUser = await User.findById(req.session.userId);
        }

        // ✅ แก้ไข Path ตรงนี้ให้ตรงกับที่น้องสาววางไฟล์ไว้
        // ถ้าน้องวางไว้ใน views/special-template.ejs โดยตรง ให้ใช้ชื่อไฟล์ได้เลย
        res.render('special-template', { 
            quest: quest,
            user: currentUser 
        });

    } catch (error) {
        console.error("Route Error:", error);
        res.status(500).send("เกิดข้อผิดพลาดในการโหลดภารกิจ: " + error.message);
    }
});

app.use((err, req, res, next) => {
    if (err && err.type === 'entity.too.large') {
        console.log("🛑 Caught: Payload Too Large (User tried to upload a big file)");
        return res.status(413).json({ 
            success: false, 
            message: "รูปภาพมีขนาดใหญ่เกินไป ระบบรับไม่ไหวจ้า!" 
        });
    }
    next(err);
});

app.listen(4000, () => {
 console.log("App listening on port 4000")
})