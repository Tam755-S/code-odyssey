def check(safe_globals):
    try:
        # 1. ดึงค่าตัวแปรสุดท้ายจากหน่วยความจำ
        final_price = safe_globals.get("final_price")

        # 2. ตรวจสอบว่ามีการคำนวณและประกาศตัวแปรหรือไม่
        if final_price is None:
            return False

        # 3. ตรวจสอบ Logic การคำนวณตามลำดับที่ลุงสันติสั่ง:
        # ขั้นที่ 1: ตั้งราคา 1000
        # ขั้นที่ 2: หักส่วนลด 100 -> 1000 - 100 = 900
        # ขั้นที่ 3: บวกภาษี 7% -> 900 * 1.07 = 963.0
        
        # ผลลัพธ์สุดท้ายต้องเป๊ะคือ 963.0
        is_logic_correct = (final_price == 963.0)

        # 4. ตรวจสอบชนิดข้อมูล (Type Check)
        # เนื่องจากมีการคูณด้วย 1.07 ผลลัพธ์ใน Python จะกลายเป็น float โดยอัตโนมัติ
        is_type_correct = isinstance(final_price, float)

        # 🎯 ต้องผ่านทุกเงื่อนไข
        return is_logic_correct and is_type_correct

    except Exception:
        return False