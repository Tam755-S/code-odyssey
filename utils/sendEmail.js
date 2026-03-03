const emailjs = require('@emailjs/nodejs');

module.exports = async (to, code) => {
    console.log(`🚀 [EmailJS] กำลังส่งเมลหา: ${to}`);

    // ตัวแปรเหล่านี้ต้องชื่อตรงกับในปีกกา {{ }} ของหน้าเว็บ EmailJS นะคะ
    const templateParams = {
        email: to,           // ส่งไปที่ {{email}}
        passcode: code,      // ส่งไปที่ {{passcode}}
        time: "10 minutes"   // ส่งไปที่ {{time}}
    };

    try {
        const result = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            templateParams,
            {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                privateKey: process.env.EMAILJS_PRIVATE_KEY,
            }
        );

        console.log("✅ [EmailJS] เมลส่งออก สำเร็จแล้ว!", result.text);
        return result;
    } catch (error) {
        console.error("❌ EmailJS Error:", error);
        throw new Error("ระบบส่งอีเมลขัดข้อง");
    }
};