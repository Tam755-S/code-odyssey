const User = require('../models/User')

exports.finishTour = async (req, res) => {
  if (req.session.userId) {
    // กรณี User: บันทึกลง Database
    await User.findByIdAndUpdate(req.session.userId, {
      tourCompleted: true
    })
  } else {
    // กรณี Guest: บันทึกลง Session เพื่อให้ mainController ตรวจเจอ
    req.session.tourCompleted = true;
  }

  res.json({ success: true })
}