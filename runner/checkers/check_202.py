def check(safe_globals):
    try:
        # 1. ดึงค่าตัวแปรจากหน่วยความจำ
        staff = safe_globals.get("staff")
        price = safe_globals.get("price")
        received = safe_globals.get("received")
        change = safe_globals.get("change")

        # 2. ตรวจสอบชื่อตัวแปรที่โจทย์ห้ามใช้ (ตัวแปรที่ตั้งมาผิดใน starterCode)
        # ถ้ายังมีตัวแปรเหล่านี้อยู่ แสดงว่าผู้เล่นอาจจะไม่ได้ซ่อมโค้ดตามที่ป้าสมศรีบอก
        forbidden_vars = ["total_price", "money_received", "staff_name"]
        for f_var in forbidden_vars:
            if f_var in safe_globals:
                return False

        # 3. ตรวจสอบชนิดข้อมูล (Type Check)
        # ราคาและเงินที่รับมาควรเป็นตัวเลข (int หรือ float) เพื่อให้ลบกันได้
        is_type_ok = (
            isinstance(staff, str) and
            isinstance(price, (int, float)) and
            isinstance(received, (int, float)) and
            isinstance(change, (int, float))
        )

        # 4. ตรวจสอบ Logic การคำนวณเงินทอน (Value Check)
        # เงินทอนต้องเท่ากับ เงินที่รับมา - ราคาสินค้า
        is_logic_ok = False
        if is_type_ok:
            is_logic_ok = (change == received - price)

        # 🎯 ต้องผ่านทุกเงื่อนไข
        return is_type_ok and is_logic_ok

    except Exception:
        return False