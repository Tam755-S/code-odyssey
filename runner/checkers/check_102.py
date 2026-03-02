def check(safe_globals):
    try:
        # ดึงค่าตัวแปร
        p_name = safe_globals.get("product_name")
        p_price = safe_globals.get("product_price")
        p_stock = safe_globals.get("stock_quantity")
        p_ready = safe_globals.get("is_ready")
        inv_list = safe_globals.get("inventory_list")

        # 1. เช็คว่าตัวแปรพื้นฐานมีครบและค่าถูกต้องไหม
        # ใช้ abs() เช็คราคาเพื่อป้องกันปัญหาทศนิยมเพี้ยน
        is_data_ok = (
            str(p_name) == "Healing Potion" and
            abs(float(p_price) - 150.5) < 0.01 and
            int(p_stock) == 20 and
            (p_ready == True or p_ready == 1)
        )

        # 2. เช็ค List (เอาแบบยืดหยุ่นที่สุด)
        # ขอแค่เป็น List และมีสมาชิกอย่างน้อย 4 ตัว
        is_list_ok = isinstance(inv_list, list) and len(inv_list) >= 4
        
        # 3. เช็คว่าใน List มีค่าที่เราต้องการอยู่จริงไหม (แปลงเป็น string เทียบเพื่อความชัวร์)
        list_content_str = str(inv_list)
        is_content_ok = "Healing Potion" in list_content_str and "150.5" in list_content_str and "20" in list_content_str

        return bool(is_data_ok and is_list_ok and is_content_ok)
    except:
        return False