function updateClock() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();

    if (h < 10) h = "0" + h;
    if (m < 10) m = "0" + m;

    document.getElementById("clock").textContent = `${h}:${m}`;

    // เปลี่ยนไอคอนกลางวัน/กลางคืน
    const icon = document.getElementById("timeIcon");
    if (now.getHours() >= 6 && now.getHours() < 18) {
        icon.src = "/css/sun.PNG";
    } else {
        icon.src = "/css/moon.PNG";
    }
}

setInterval(updateClock, 1000);
updateClock();

// เปิดป๊อปอัพ
function openPage(page) {
  document.getElementById("popup-overlay").style.display = "block";
  document.getElementById("popup-window").style.display = "block";

  document.getElementById("popup-content").src = page;
  document.getElementById("popup-title").textContent =
    page.split('/').pop().replace('.html', '');
    let name = page.split('/').pop().replace('.html', '');
name = name.charAt(0).toUpperCase() + name.slice(1);

document.getElementById("popup-title").textContent = name;

}

// ปิดป๊อปอัพ (ฉบับอัปเกรดตามเงื่อนไขภารกิจ)
document.getElementById("btn-close").onclick = async () => {
    const iframe = document.getElementById('popup-content');
    const popupTitle = document.getElementById('popup-title').innerText; // ดึงชื่อหัวข้อมาเช็ค
    let iframeUrl = "";
    
    try { 
        iframeUrl = iframe.contentWindow.location.pathname; 
    } catch(e) { 
        return closePopupWindow(); 
    }

    const isSpecialQuest = iframeUrl.includes('/editor/special/');
    const isNormalQuest = iframeUrl.includes('/editor/') && !isSpecialQuest;

    if (isSpecialQuest || isNormalQuest) {
    const modal = document.getElementById('confirm-exit-modal');
    const modalMsg = document.getElementById('exit-modal-msg');
    const btnYes = document.getElementById('confirm-yes'); 
    const btnNo = document.getElementById('confirm-no');

    // 1. ตั้งค่าข้อความ Modal ตามประเภทเควส
    if (isSpecialQuest) {
        modalMsg.innerText = "ภารกิจยังไม่เสร็จสิ้น คุณต้องการออกจากภารกิจใช่หรือไม่? \n หากกด YES ภารกิจจะหายไปและไม่ได้เงินรางวัล";
    } else if (popupTitle === "Documents") {
        modalMsg.innerText = "ภารกิจยังไม่เสร็จสิ้น คุณต้องการพักภารกิจหรือไม่? หากกด Yes ภารกิจจะยังอยู่ที่ Documents \n กด No เพื่อทำภารกิจต่อ";
    } else {
        modalMsg.innerText = "ภารกิจยังไม่เสร็จสิ้น คุณต้องการพักภารกิจหรือไม่? หากกด Yes ภารกิจจะถูกส่งไปที่ Documents \n กด No เพื่อทำภารกิจต่อ";
    }

    modal.style.display = 'flex';

    // 2. ส่วนของปุ่ม YES (รวม Logic พิเศษและปกติเข้าด้วยกัน)
    btnYes.onclick = async () => {
        const questId = iframeUrl.split('/').pop();
        
        if (isSpecialQuest) {
            const iframe = document.getElementById('popup-content');
            // 🚀 สั่ง Iframe ให้จัดการตัวเอง (บันทึก Failed และ Redirect)
            if (iframe && iframe.contentWindow && typeof iframe.contentWindow.processSubmit === 'function') {
                iframe.contentWindow.processSubmit(true);
            } else {
                // สำรองข้อมูลถ้าสั่ง Iframe ไม่ได้
                await fetch('/special-quest/abandon', { 
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'}, 
                    body: JSON.stringify({ questId: Number(questId) })
                });
                closePopupWindow();
                location.reload();
            }
        } else {
            // ✅ เควสปกติ
            await fetch('/quests/move-to-document', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ questId: Number(questId) })
            });
            closePopupWindow();
            location.reload();
        }
        modal.style.display = 'none';
    };

    // 3. ส่วนของปุ่ม NO
    btnNo.onclick = () => {
        modal.style.display = 'none';
    };

} else {
    // ถ้าไม่ใช่เควส ให้ปิดหน้าต่างปกติ
    closePopupWindow();
}
};

// ฟังก์ชันช่วยปิดหน้าต่าง
function closePopupWindow() {
    document.getElementById("popup-overlay").style.display = "none";
    document.getElementById("popup-window").style.display = "none";
    document.getElementById("popup-content").src = "about:blank";
}

// ขยาย/ย่อป๊อปอัพ
let maximized = false;
document.getElementById("btn-max").onclick = () => {
  let win = document.getElementById("popup-window");

  if (!maximized) {
    win.style.top = "0";
    win.style.left = "0";
    win.style.width = "100vw";
    win.style.height = "100vh";
  } else {
    win.style.width = "800px";
    win.style.height = "500px";
    win.style.top = "100px";
    win.style.left = "calc(50% - 400px)";
  }
  maximized = !maximized;
};

// ระบบลากหน้าต่าง popup
let popup = document.getElementById("popup-window");
let header = document.getElementById("popup-header");
let x = 0, y = 0, drag = false;

header.onmousedown = (e) => {
  drag = true;
  x = e.clientX - popup.offsetLeft;
  y = e.clientY - popup.offsetTop;
};

document.onmousemove = (e) => {
  if (drag) {
    popup.style.left = (e.clientX - x) + "px";
    popup.style.top = (e.clientY - y) + "px";
  }
};

document.onmouseup = () => drag = false;
