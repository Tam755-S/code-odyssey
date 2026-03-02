def check(safe_globals):
    try:
        # 1. ดึงค่าตัวแปรที่ผู้เล่นประกาศไว้
        name = safe_globals.get("name")
        age = safe_globals.get("age")
        salary = safe_globals.get("salary")
        is_member = safe_globals.get("is_member")

        # 2. ตรวจสอบความถูกต้องของข้อมูล (Value Check)
        is_value_correct = (
    str(name) == "Somchai" and
    int(age) == 28 and
    abs(float(salary) - 15000.50) < 0.01 and  # กันเหนียวเรื่อง float
    (is_member == True)
)

        # 3. ตรวจสอบชนิดข้อมูล (Type Check)
        # โจทย์บังคับให้ age เป็น int และ salary เป็น float
        is_type_correct = (
            isinstance(name, str) and
            isinstance(age, int) and
            isinstance(salary, float) and
            isinstance(is_member, bool)
        )

        # 🎯 Logic เพิ่มเติม: ตรวจสอบว่าใน safe_globals มีตัวแปรครบตามชื่อที่สั่งหรือไม่
        required_vars = ["name", "age", "salary", "is_member"]
        has_all_vars = all(var in safe_globals for var in required_vars)

        # ส่งผลลัพธ์: ต้องผ่านทุกเงื่อนไข
        return is_value_correct and is_type_correct and has_all_vars

    except Exception:
        return False