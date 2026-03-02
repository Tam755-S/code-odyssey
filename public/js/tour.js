/* ============================================================
   TOUR SYSTEM (Final Optimized - Natasha Style UI)
   - Fixed Button Overlap on Lily's name
   - Typewriter Effect for Intro steps
   - Screen boundary detection for all icons
   - Instant Hide on Finish (Fixed Center Bug)
   - Global Click Support (Click anywhere to progress)
   ============================================================ */

let currentTourStep = 0;
let tourStepsData = [];
let typewriterInterval = null;
let isTyping = false; // ตัวแปรเช็คสถานะการพิมพ์

// ✅ ฟังก์ชันพิมพ์ตัวอักษรทีละตัวแบบเสถียร
function typeWriter(text, element, speed = 30) {
    if (!element) return;
    element.innerHTML = "";
    clearInterval(typewriterInterval);
    isTyping = true; // เริ่มพิมพ์
    
    let i = 0;
    const nextBtn = document.getElementById('tour-next');
    if (nextBtn) {
        nextBtn.style.opacity = "0.5";
        nextBtn.disabled = true;
    }

    typewriterInterval = setInterval(() => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
        } else {
            clearInterval(typewriterInterval);
            isTyping = false; // พิมพ์เสร็จแล้ว
            if (nextBtn) {
                nextBtn.style.opacity = "1";
                nextBtn.disabled = false;
            }
        }
    }, speed);
}

// ✅ ฟังก์ชันสำหรับไปขั้นตอนถัดไป (ใช้ร่วมกันทั้งปุ่มและคลิกจอ)
function handleNextStep() {
    // ป้องกันการกดเบิ้ล หรือกดขณะกำลังพิมพ์
    if (isTyping) return;

    currentTourStep++;
    renderTourStep();
}

window.startTour = function() {
    console.log("🚀 Tour system starting (Natasha UI mode)...");

    // 🧹 กันซ้ำ (เผื่อเรียกซ้ำ)
    document.getElementById('tour-overlay')?.remove();
    document.getElementById('tour-tooltip')?.remove();

    // ✅ สร้าง overlay
    const overlay = document.createElement('div');
    overlay.id = 'tour-overlay';

    // ✅ สร้าง tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'tour-tooltip';

    document.body.appendChild(overlay);
    document.body.appendChild(tooltip);

    const playerName = window.PLAYER_NAME || "Developer";

    // ✨ โครงสร้าง HTML ภายใน tooltip
    tooltip.innerHTML = `
        <div id="tour-content-area" style="flex:1; display:flex; flex-direction:column; justify-content:space-between; pointer-events: auto;">
            <div id="tooltip-text"></div>
            <div class="tooltip-actions">
                <button id="tour-skip">Skip</button>
                <button id="tour-next">Next</button>
            </div>
        </div>
        <div class="lily-container">
            <div class="lily-img"></div>
            <div class="lily-name">Lily</div>
        </div>
    `;

    // ✅ Bind คลิกที่ปุ่ม
    document.getElementById('tour-next').onclick = (e) => {
        e.stopPropagation(); // กัน event ลามไปถึง overlay
        handleNextStep();
    };

    document.getElementById('tour-skip').onclick = (e) => {
        e.stopPropagation();
        finishTourSystem(true);
    };

    // ✅ [NEW] คลิกตรงไหนก็ได้บน Overlay (พื้นที่มืด) เพื่อไปต่อ
    overlay.onclick = () => {
        handleNextStep();
    };

    // ✅ [NEW] คลิกในตัว Tooltip (ยกเว้นปุ่ม) เพื่อไปต่อ
    tooltip.onclick = (e) => {
        if (e.target.tagName !== 'BUTTON') {
            handleNextStep();
        }
    };

    tourStepsData = [
        { isIntro: true, text: `สวัสดีค่ะ คุณ ${playerName} ยินดีต้อนรับสู่ Code Odyssey บริษัทรับจ้างเขียนโค้ดไพทอน ฉันชื่อลิลลี่ เป็นเพื่อนร่วมงานของคุณค่ะ` },
        { isIntro: true, text: `เนื่องจากคุณเป็นพนักงานใหม่ ฉันจึงได้รับมอบหมายให้พาคุณไปทำความรู้จักกับเครื่องมือต่าง ๆ เพื่อให้การทำงานของคุณราบรื่น` },
        { target: '.sidebar .icon-box:nth-child(1)', text: '<strong>HELPER</strong>ตัวช่วยสำหรับการเล่นเกม ใช้สำหรับดูคำแนะนำแต่ละไอคอนย้อนหลังได้ตลอดเวลาค่ะ' },
        { target: '.sidebar .icon-box:nth-child(2)', text: '<strong>LEARNING</strong>แหล่งเรียนรู้บทเรียนหลักสำหรับการฝึกเขียน Python เบื้องต้นทั้งหมด 7 บท' },
        { target: '.sidebar .icon-box:nth-child(3)', text: '<strong>INBOX</strong>กล่องรับภารกิจทั่วไป แบ่งเป็น 3 ประเภท: A (จำ), B (คำนวณ), C (แก้ปัญหา) สังเกตได้จากวงเล็บท้ายชื่อลูกค้า เช่น น้องบี(A) เพื่อเลือกฝึกทักษะที่ต้องการและรับรางวัล!' },
        { target: '.sidebar .icon-box:nth-child(4)', text: '<strong>COMPANY CHAT</strong>ภารกิจด่วนจะปรากฏที่นี่เมื่อทำเควสปกติใน INBOX ครบทุก 5 ข้อ มีเวลาจำกัดและให้โบนัสสูงหรือจะเลือกปฏิเสธก็ได้' },
        { target: '.sidebar .icon-box:nth-child(5)', text: '<strong>DOCUMENTS</strong>คลังงานเก็บภารกิจที่ยังทำไม่สำเร็จหรือกดพักไว้ เพื่อกลับมาแก้ไขและส่งใหม่เพื่อรับรางวัล' },
        { target: '.left-group button:nth-of-type(1)', text: '<strong>SHOP</strong>ร้านค้าไอเทมตกแต่ง ใช้เหรียญรางวัลที่สะสมได้จากการทำภารกิจ มาแลกซื้อวอลเปเปอร์และไอคอนสวย ๆ เพื่อปรับแต่งหน้าจอส่วนตัวของคุณ' },
        { target: '.left-group button:nth-of-type(2)', text: '<strong>SETTING</strong>เมนูที่ใช้สำหรับตรวจสอบสถิติการเรียนรู้และเปลี่ยนรูปโปรไฟล์ของคุณ' },
        { target: '#coin-display', text: '<strong>COIN</strong>นี่คือจำนวนเหรียญปัจจุบันที่คุณมีจ้า พยายามสะสมให้เยอะ ๆ นะ!' }
    ];

    currentTourStep = 0;
    renderTourStep();
};

function renderTourStep() {
    const overlay = document.getElementById('tour-overlay');
    const tooltip = document.getElementById('tour-tooltip');
    const skipBtn = document.getElementById('tour-skip');
    const textTarget = document.getElementById('tooltip-text');

    if (currentTourStep >= tourStepsData.length) {
        finishTourSystem(true);
        return;
    }

    const current = tourStepsData[currentTourStep];
    document.querySelectorAll('.tour-target').forEach(el => el.classList.remove('tour-target'));
    clearInterval(typewriterInterval);
    isTyping = false; // รีเซ็ตสถานะพิมพ์

    overlay.style.display = 'block';
    tooltip.style.display = 'flex';

    if (current.isIntro) {
        // --- PART 1: กลางจอ ---
        skipBtn.style.display = 'none';
        tooltip.classList.add('tour-center');
        tooltip.style.left = '50%';
        tooltip.style.top = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
        overlay.style.boxShadow = 'none';
        
        typeWriter(current.text, textTarget);
    } else {
        // --- PART 2: แนะนำไอคอน ---
        skipBtn.style.display = 'block';
        tooltip.classList.remove('tour-center');
        tooltip.style.transform = 'none';
        
        const targetEl = document.querySelector(current.target);
        if (!targetEl) {
            console.warn("Target not found, skipping step:", current.target);
            currentTourStep++;
            renderTourStep();
            return;
        }

        targetEl.classList.add('tour-target');
        const rect = targetEl.getBoundingClientRect();
        overlay.style.backgroundColor = 'transparent';
        overlay.style.boxShadow = `0 0 0 9999px rgba(0,0,0,0.75)`;

        textTarget.innerHTML = current.text;

        // ✅ Logic ปรับตำแหน่งไม่ให้ตกขอบ
        let tooltipWidth = 650;
        let left = rect.right + 25;
        let top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;

        if (left + tooltipWidth > window.innerWidth) {
            left = rect.left - tooltipWidth - 25;
        }

        if (top + tooltip.offsetHeight > window.innerHeight) {
            top = window.innerHeight - tooltip.offsetHeight - 20;
        }
        if (top < 10) top = 10;
        if (left < 10) left = 10;

        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
}

function finishTourSystem(shouldSave) {
    console.log("🏁 Finishing Tour...");
    
    const overlay = document.getElementById('tour-overlay');
    const tooltip = document.getElementById('tour-tooltip');
    
    if (overlay) overlay.style.display = 'none';
    if (tooltip) tooltip.style.display = 'none';
    
    document.querySelectorAll('.tour-target').forEach(el => el.classList.remove('tour-target'));

    if (shouldSave) {
        console.log("💾 Saving tour status...");
        fetch('/user/finish-tour', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(() => {
            console.log("✅ Update complete, reloading...");
            location.reload(); 
        })
        .catch(err => {
            console.error("❌ Update failed:", err);
            location.reload();
        });
    }
}

window.addEventListener('resize', () => {
    const overlay = document.getElementById('tour-overlay');
    if (overlay && overlay.style.display === 'block') {
        renderTourStep();
    }
});