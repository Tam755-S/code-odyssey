// ✅ ดึงสถานะการปลดล็อกคำใบ้จากหน้า EJS (ที่ส่งมาจาก Controller)
let hasBoughtHint = (window.IS_HINT_UNLOCKED === true || window.IS_HINT_UNLOCKED === "true");
let purchasedHintText = window.QUEST.hint || ""; // เตรียมคำใบ้รอไว้ถ้าเคยซื้อแล้ว
const outputArea = document.getElementById("output-area");
const runBtn = document.getElementById("runBtn");
const submitBtn = document.getElementById("submitBtn");

// ================= MONACO EDITOR =================
require.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }
});

require(['vs/editor/editor.main'], function () {
  window.editor = monaco.editor.create(
    document.getElementById('editor'),
    {
      value: QUEST.starterCode || '',
      language: QUEST.language || 'python',
      theme: 'vs-dark',
      automaticLayout: true
    }
  );
});

/* ===============================
    CUSTOM MODAL FUNCTION 
=============================== */
function showModal(message, type = 'alert', onConfirm = null) {
    const overlay = document.getElementById('custom-modal-overlay');
    const msgPara = document.getElementById('modal-message');
    const btnContainer = document.getElementById('modal-buttons');
    const modalTitle = document.getElementById('modal-title');
    
    if (!overlay) return alert(message);

    msgPara.innerHTML = message; // เปลี่ยนเป็น innerHTML เผื่อใส่ <br> จ้า
    btnContainer.innerHTML = ''; 
    overlay.style.display = 'flex';

    if (type === 'confirm') {
        const yesBtn = document.createElement('button');
        yesBtn.innerText = 'YES';
        yesBtn.onclick = () => { overlay.style.display = 'none'; if (onConfirm) onConfirm(); };
        
        const noBtn = document.createElement('button');
        noBtn.innerText = 'NO';
        noBtn.style.background = '#ff4444';
        noBtn.onclick = () => overlay.style.display = 'none';
        
        btnContainer.appendChild(yesBtn);
        btnContainer.appendChild(noBtn);
    } else {
        const okBtn = document.createElement('button');
        okBtn.innerText = 'OK';
        okBtn.onclick = () => { overlay.style.display = 'none'; if (onConfirm) onConfirm(); };
        btnContainer.appendChild(okBtn);
    }
}

// ================= HINT SYSTEM (หักเงินครั้งเดียว ดูซ้ำฟรี และเปลี่ยนชื่อปุ่ม) =================
document.getElementById("hintBtn").onclick = () => {
    // ถ้าเคยซื้อแล้ว (เช็คจากตัวแปรที่เราเซตไว้ตอนโหลดหน้า)
    if (hasBoughtHint) {
        document.getElementById('modal-title').innerText = "SYSTEM HINT";
        document.getElementById('modal-title').style.color = "#ffcc00";
        // ดึง Hint จากตัวแปร QUEST ที่มีอยู่แล้วมาโชว์เลย
        showModal(QUEST.hint || "ตั้งใจทำงานนะจ๊ะ!", 'alert');
        return;
    }

    // ถ้ายังไม่ซื้อ ให้ถามยืนยัน
    showModal("คุณต้องการซื้อคำใบ้ในราคา 50 เหรียญ ใช่หรือไม่?", 'confirm', async () => {
        const res = await fetch("/quests/buy-hint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questId: QUEST.id })
        });
        const result = await res.json();
        
        if (result.success) {
            hasBoughtHint = true;
            // 💡 เปลี่ยนข้อความปุ่มทันที
            const btnText = document.getElementById('hintBtnText');
            if (btnText) btnText.innerText = 'ดูคำใบ้';

            // 💰 อัปเดตเงินบนหน้าจอหลัก (Parent)
            try {
                window.parent.postMessage({ type: 'updateMoney', newBalance: result.currentMoney }, '*');
            } catch (e) {}

            document.getElementById('modal-title').innerText = "SYSTEM SUCCESS";
            showModal(result.hint, 'alert');
        } else {
            showModal(result.message, 'alert');
        }
    });
};

// ================= RUN CODE =================
runBtn.onclick = async () => {
  outputArea.textContent = "Running...";
  const res = await fetch("/editor/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: editor.getValue() })
  });
  const result = await res.json();
  outputArea.textContent = (result.output || result.error || "").trim() || "Run success ✔";
};

// ================= SUBMIT & EXPLANATION =================
submitBtn.onclick = async () => {
  const actualOutput = outputArea.textContent.trim();
  const isCorrectLocally = actualOutput === String(QUEST.expectedOutput).trim();
  
  if (!isCorrectLocally || actualOutput === "" || actualOutput === "Running...") {
    showModal("คำตอบยังไม่ถูกต้อง ภารกิจจะถูกย้ายไปที่ Documents ต้องการส่งหรือไม่?", 'confirm', () => {
        sendSubmitRequest(editor.getValue(), actualOutput);
    });
  } else {
    sendSubmitRequest(editor.getValue(), actualOutput);
  }
};

async function sendSubmitRequest(code, actualOutput) {
    // ✅ 1. ยิง Fetch ไปที่ URL ใหม่ให้ตรงกับ index.js
    const res = await fetch("/editor/submit", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId: QUEST.id, code, actualOutput })
    });

    // 🚩 2. ห้ามลืมบรรทัดนี้เด็ดขาด! (ไม่งั้นจะขึ้น result is not defined)
    const result = await res.json();

    if (result.success) {
        document.getElementById('modal-title').innerText = "SUCCESS!";
        document.getElementById('modal-title').style.color = "#00ff00";
        showModal(result.message || "ภารกิจสำเร็จ!", 'alert', () => {
            // ✅ ดึงคำอธิบายมาโชว์ (ถ้าใน Controller ส่งมา หรือมีใน QUEST)
            const explanation = result.explanation || QUEST.explanation;
            if (explanation) {
                document.getElementById('modal-title').innerText = "EXPLANATION";
                document.getElementById('modal-title').style.color = "#5dade2";
                showModal(explanation, 'alert', () => {
                    window.parent.location.href = "/main"; 
                });
            } else {
                window.parent.location.href = "/main"; 
            }
        });
    } else {
        // ❌ กรณีตอบผิด และ Controller สั่งย้ายไป Documents แล้ว
        showModal(result.message || "คำตอบยังไม่ถูกต้อง ระบบย้ายงานไปที่ Documents แล้ว", 'alert', () => {
            window.parent.location.href = "/main"; 
        });
    }
}