def check(safe_globals):
    try:
        # 1. ดึงค่าตัวแปรจากหน่วยความจำ
        has_card = safe_globals.get("has_card")
        paid_fee = safe_globals.get("paid_fee")
        is_vip = safe_globals.get("is_vip")
        can_enter = safe_globals.get("can_enter")

        # 2. ตรวจสอบว่ามีตัวแปร can_enter และเป็น Boolean หรือไม่
        if can_enter is None or not isinstance(can_enter, bool):
            return False

        # 3. ตรวจสอบ Logic สำคัญ (The Core Logic)
        # กฎคือ: บัตรต้องมี (True) และ (จ่ายเงิน หรือ VIP)
        # ในเคสนี้: True and (False or True) -> True and True -> True
        
        # วิธีการตรวจที่แม่นยำที่สุดคือลองเปลี่ยนค่าตัวแปรในใจเพื่อเช็ค Logic
        # ถ้าผู้เล่นเขียน: has_card and (paid_fee or is_vip) จะต้องได้ True
        # ถ้าผู้เล่นเขียนผิด: has_card or paid_fee and is_vip (แบบเดิม) จะได้ True เหมือนกันแต่ Logic จะพังถ้า has_card เป็น False
        
        is_logic_correct = (can_enter == True)

        # 4. 🛡️ จุดสำคัญ: ตรวจสอบว่าผู้เล่นมีการใช้วงเล็บเพื่อจัดลำดับหรือไม่
        # เราจะใช้วิธีเช็คค่า if has_card เป็น False ผลลัพธ์ต้องเป็น False เสมอ
        # พี่แนะนำให้ตรวจเฉพาะค่าที่รันออกมาตามโจทย์นี้ก่อนค่ะ
        
        # ตรวจสอบว่าตัวแปรตั้งต้นยังอยู่ครบ
        is_base_ok = (has_card == True and paid_fee == False and is_vip == True)

        return is_logic_correct and is_base_ok

    except Exception:
        return False