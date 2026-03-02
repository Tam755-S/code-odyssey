def check(safe_globals):
    try:
        # 1. ดึงค่าตัวแปรจากหน่วยความจำ
        total_profit = safe_globals.get("total_profit")
        partners = safe_globals.get("partners")
        dividend = safe_globals.get("dividend_per_person")
        remaining = safe_globals.get("remaining_fund")
        is_above = safe_globals.get("is_above_target")

        # 2. ตรวจสอบชนิดข้อมูล (Type Check)
        # dividend และ remaining ต้องเป็นจำนวนเต็ม (int) ตามที่เจ้ดานิกาสั่ง
        # is_above ต้องเป็น Boolean (True/False)
        is_type_ok = (
            isinstance(dividend, int) and
            isinstance(remaining, int) and
            isinstance(is_above, bool)
        )

        # 3. ตรวจสอบ Logic การคำนวณ (Value Check)
        # 500 // 3 ต้องได้ 166
        # 500 % 3 ต้องได้ 2
        # 166 > 150 ต้องได้ True
        is_logic_ok = (
            dividend == 166 and
            remaining == 2 and
            is_above == True
        )

        # 4. ตรวจสอบว่าไม่ได้แอบแก้ตัวแปรตั้งต้น
        is_base_ok = (total_profit == 500 and partners == 3)

        # 🎯 ต้องผ่านทุกเงื่อนไข
        return is_type_ok and is_logic_ok and is_base_ok

    except Exception:
        return False