import sys, io

# ✅ บังคับ UTF-8
sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    full_input = sys.stdin.read()
    quest_id, user_code = None, ""

    if "---SPLIT---" in full_input:
        parts = full_input.split("---SPLIT---", 1)
        quest_id = parts[0].strip()
        user_code = parts[1]
    else:
        user_code = full_input
except Exception as e:
    sys.exit(1)

# 🛡️ ระบบ Mock Data สำหรับเควสที่มี input()
mock_responses = {
    "101": [],
    "201": ["Somchai", "28"],
    # เพิ่มเควสอื่นๆ ตามต้องการ
}
current_mocks = mock_responses.get(str(quest_id), [])

def safe_input(prompt=""):
    if current_mocks:
        return str(current_mocks.pop(0))
    return "0"

# 🏗️ Sandbox
safe_builtins = {
    "print": print, 
    "input": safe_input,
    "int": int, "float": float, "str": str, "len": len, 
    "range": range, "list": list, "bool": bool, "type": type,
    "True": True, "False": False, "isinstance": isinstance,
    "format": format
}
safe_globals = { "__builtins__": safe_builtins }

# 🛑 บล็อก __import__ เพื่อไม่ให้ใช้ os, sys หรือแอบอ่านไฟล์ได้
safe_globals = { 
    "__builtins__": safe_builtins,
    "__name__": "__main__",
    "__doc__": None,
    "__package__": None
}

try:
    # 🚀 รันโค้ดผู้เล่น และให้แสดงผลออกทาง stdout ปกติ
    exec(user_code, safe_globals)
except Exception as e:
    print(f"ERROR: {e}")