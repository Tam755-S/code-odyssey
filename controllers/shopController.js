const User = require('../models/User');
const shopData = require('../models/shopModel');

exports.showShop = async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');
        const user = await User.findById(req.session.userId);
        res.render('shop', { user, shopData, error: req.flash('error'), success: req.flash('success') });
    } catch (err) { res.redirect('/main'); }
};

exports.buyItem = async (req, res) => {
    try {
        const { itemId, type, price } = req.body;
        const user = await User.findById(req.session.userId);
        const itemPrice = Number(price);

        if (user.money >= itemPrice) {
            user.money -= itemPrice;
            if (type === 'icon') {
                if (!user.inventory.ownedIcons.includes(itemId)) user.inventory.ownedIcons.push(itemId);
            } else {
                if (!user.inventory.ownedWallpapers.includes(itemId)) user.inventory.ownedWallpapers.push(itemId);
            }
            user.markModified('inventory'); 
            await user.save();
            return res.json({ success: true, money: user.money });
        } else {
            return res.json({ success: false, message: 'เงินไม่พอค่ะ!' });
        }
    } catch (err) { res.status(500).json({ success: false }); }
};

exports.equipItem = async (req, res) => {
    try {
        const { itemId, slot, action } = req.body;
        const user = await User.findById(req.session.userId);

        if (action === 'unequip') {
            // ✅ เปลี่ยนจาก /Main.png เป็น /css/Main.png ให้ตรงกับข้อมูลในระบบค่ะ
            const defaults = { 
                helper: '/css/helper.PNG', 
                learning: '/css/book.PNG', 
                inbox: '/css/inbox.PNG', 
                company: '/css/company.PNG', 
                documents: '/css/mistake.PNG', 
                wallpaper: '/css/Main.png' 
            };
            user.inventory.equipped[slot] = defaults[slot];
        } else {
            const item = [...shopData.icons, ...shopData.wallpapers].find(i => i.id === itemId);
            if (item) user.inventory.equipped[slot] = item.img;
        }

        user.markModified('inventory.equipped');
        await user.save();
        res.json({ success: true, money: user.money, equipped: user.inventory.equipped });
    } catch (err) { res.status(500).json({ success: false }); }
};