// ใน scripts.js
// ... (โค้ดอื่นๆ ของ Dynamic Window และ Drag/Drop) ...

// ** ฟังก์ชันสำหรับ Scroll ไปยัง ID ที่ต้องการ **
function scrollToSection(sectionId) {
    // 1. หาพื้นที่เนื้อหาหลักที่ต้องการให้ Scroll 
    const mainContentArea = document.querySelector('.lesson-main'); 
    const targetElement = document.getElementById(sectionId);

    if (mainContentArea && targetElement) {
        
        // สั่งให้พื้นที่ Content เลื่อนไปยังตำแหน่งขององค์ประกอบเป้าหมาย
        mainContentArea.scrollTop = targetElement.offsetTop; 
       
    } else {
        console.error(`Section ID: ${sectionId} not found in content area.`);
    }
}