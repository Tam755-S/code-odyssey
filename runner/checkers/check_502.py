def check(safe_globals):
    try:
        # 1. ตรวจสอบรายการตั้งต้น (items)
        items = safe_globals.get("items")
        if items != ["Apple", "Expired", "Banana", "Stop", "Orange"]:
            return False

        # 2. ในเคสนี้เนื่องจากผลลัพธ์ส่วนใหญ่อยู่ที่การ print
        # เราจะใช้วิธีการตรวจสอบ "ผลลัพธ์สะสม" (ถ้ามี) 
        # หรือตรวจสอบว่าผู้เล่นประกาศตัวแปร x ไว้ที่ค่าสุดท้ายเป็นอะไร
        
        # ตาม Logic ที่ถูกต้อง:
        # รอบ 1: "Apple" -> print
        # รอบ 2: "Expired" -> continue (ข้ามรอบ)
        # รอบ 3: "Banana" -> print
        # รอบ 4: "Stop" -> break (หยุดทันที)
        # ดังนั้นค่า x สุดท้ายที่ค้างในหน่วยความจำต้องเป็น "Stop"
        
        last_x = safe_globals.get("x")
        
        # ตรวจสอบว่าลูปทำงานถึง Stop แล้วหยุดจริงหรือไม่
        # และต้องไม่ทำงานไปถึง "Orange"
        is_break_worked = (last_x == "Stop")
        
        # 3. ตรวจสอบว่าไม่มีตัวแปร "Orange" หลุดมาในกระบวนการตรวจสอบ (ถ้าผู้เล่นเก็บค่าไว้)
        # ในที่นี้ตรวจสอบความถูกต้องของ Logic ผ่านสถานะสุดท้ายของ Loop
        return is_break_worked

    except Exception:
        return False