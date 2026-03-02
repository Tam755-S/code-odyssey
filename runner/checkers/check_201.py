def check(safe_globals):
    try:
        # 1. ดึงค่าตัวแปรที่เกิดขึ้นจากการรันโค้ดของผู้เล่น
        customer = safe_globals.get("customer")
        people = safe_globals.get("people")
        total = safe_globals.get("total")

        # 2. ตรวจสอบชนิดข้อมูล (Type Check)
        # ตัวแปร people ต้องถูกแปลงเป็น int และ total ต้องเป็น int
        is_type_ok = isinstance(people, int) and isinstance(total, int)

        # 3. ตรวจสอบความถูกต้องของการคำนวณ (Value Check)
        # โจทย์สั่งให้บวกเก้าอี้เสริม 1 ตัว ดังนั้น total ต้องเท่ากับ people + 1
        is_logic_ok = (total == people + 1)

        # 4. ตรวจสอบการมีอยู่ของชื่อลูกค้า
        has_customer = customer is not None and isinstance(customer, str)

        # 🎯 ต้องผ่านทุกเงื่อนไขถึงจะส่ง PASSED_LOGIC กลับไป
        return is_type_ok and is_logic_ok and has_customer

    except Exception:
        # หากเกิด Error ระหว่างตรวจให้ถือว่าไม่ผ่าน
        return False