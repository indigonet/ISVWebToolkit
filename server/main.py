import os
import shutil
import subprocess
import json
import re
import zipfile
import base64
import requests
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel, EmailStr

app = FastAPI(title="APK Dashboard API")

# Configurar CORS de forma permisiva para desarrollo y ngrok
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "message": "ISV WEBKIT Backend Ready"}

# --- Auth Models ---
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ChangePasswordRequest(BaseModel):
    token: str
    new_password: str

# --- Helper for Email (Mock) ---
def send_confirmation_email(email: str, name: str):
    print(f"SIMULATING EMAIL: Sending confirmation to {email} for {name}")
    # In production use: smtplib or a service like SendGrid/SES

# --- Auth Endpoints ---
@app.post("/auth/login")
def login(req: LoginRequest):
    # Mocking JWT logic
    if req.email == "admin@isv.com" and req.password == "admin123":
        return {
            "success": True, 
            "token": "mock-jwt-token-12345", 
            "user": {"name": "Admin ISV", "email": req.email, "role": "ADMIN"}
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/auth/register")
def register(req: RegisterRequest, background_tasks: BackgroundTasks):
    # Logic to save to DB would go here
    background_tasks.add_task(send_confirmation_email, req.email, req.name)
    return {"success": True, "message": "User created. Please check your email for confirmation."}

@app.post("/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    print(f"SIMULATING RESET: Link sent to {req.email}")
    return {"success": True, "message": "Instructions sent to your email."}

@app.post("/auth/change-password")
def change_password(req: ChangePasswordRequest):
    return {"success": True, "message": "Password updated successfully."}

def find_android_tool(tool_name: str, subfolder: str = "build-tools"):
    """Search for android tools in common locations."""
    # Common SDK locations on Windows
    sdk_locations = [
        os.environ.get("ANDROID_HOME"),
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "Android", "Sdk"),
        "C:\\Android\\Sdk",
        "D:\\Android\\Sdk"
    ]
    
    for sdk in sdk_locations:
        if not sdk or not os.path.exists(sdk):
            continue
            
        base_path = os.path.join(sdk, subfolder)
        if not os.path.exists(base_path):
            continue
            
        if subfolder == "build-tools":
            # Search in versioned folders
            versions = sorted(os.listdir(base_path), reverse=True)
            for v in versions:
                tool_path = os.path.join(base_path, v, tool_name)
                if os.path.exists(tool_path):
                    return tool_path
        else:
            tool_path = os.path.join(base_path, tool_name)
            if os.path.exists(tool_path):
                return tool_path
                
    # Try system PATH
    return shutil.which(tool_name)

@app.post("/apk/analyze")
async def analyze_apk(file: UploadFile = File(...)):
    print(f"--- Received APK for analysis: {file.filename} ---")
    temp_dir = "temp_analysis"
    os.makedirs(temp_dir, exist_ok=True)
    # Sanitize filename
    safe_filename = "".join([c for c in file.filename if c.isalnum() or c in "._-"]).strip()
    if not safe_filename: safe_filename = "temp_app.apk"
    if not safe_filename.endswith(".apk"): safe_filename += ".apk"
    
    file_path = os.path.join(temp_dir, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_path = os.path.abspath(file_path)
    
    try:
        print(f"Searching for aapt.exe...")
        aapt_path = find_android_tool("aapt.exe")
        if not aapt_path:
            print("ERROR: aapt.exe not found")
            return {"error": "aapt.exe not found. Please install Android Build Tools."}
        
        print(f"Using aapt at: {aapt_path}")
        # Run aapt dump badging
        result = subprocess.run([aapt_path, "dump", "badging", file_path], capture_output=True, text=True, encoding="utf-8", errors="ignore")
        
        if result.returncode != 0:
            print(f"ERROR running aapt: {result.stderr}")
            return {"error": f"Failed to analyze APK: {result.stderr}"}
            
        print("AAPT analysis successful, parsing output...")
        output = result.stdout
        
        # Basic parsing
        info_perms = []
        info = {
            "package": "",
            "versionCode": "",
            "versionName": "",
            "label": "",
            "sdkVersion": "",
            "targetSdkVersion": "",
            "permissions": info_perms,
            "debuggable": "application-debuggable" in output,
            "iconBase64": None
        }

        icon_path = None
        
        for line in output.splitlines():
            if line.startswith("package:"):
                m = re.search(r"name='([^']*)'", line)
                if m: info["package"] = m.group(1)
                m = re.search(r"versionCode='([^']*)'", line)
                if m: info["versionCode"] = m.group(1)
                m = re.search(r"versionName='([^']*)'", line)
                if m: info["versionName"] = m.group(1)
            elif line.startswith("application:"):
                m_icon = re.search(r"icon='([^']+)'", line)
                if m_icon:
                    icon_path = m_icon.group(1)
            elif line.startswith("application-label:"):
                info["label"] = line.split(":", 1)[1].strip().strip("'")
            elif line.startswith("sdkVersion:"):
                info["sdkVersion"] = line.split(":", 1)[1].strip().strip("'")
            elif line.startswith("targetSdkVersion:"):
                info["targetSdkVersion"] = line.split(":", 1)[1].strip().strip("'")
            elif line.startswith("uses-permission:"):
                m = re.search(r"name='([^']*)'", line)
                if m: 
                    p_name = m.group(1)
                    info_perms.append(p_name)
        
        if not icon_path:
            # Fallback search for application-icon
            for line in output.splitlines():
                if line.startswith("application-icon-") or line.startswith("icon="):
                    m_icon = re.search(r"'([^']+)'", line)
                    if m_icon:
                        icon_path = m_icon.group(1)
                        break

        # Attempt to extract icon
        if icon_path:
            try:
                with zipfile.ZipFile(file_path, 'r') as z:
                    icon_data = z.read(icon_path)
                    info["iconBase64"] = base64.b64encode(icon_data).decode('utf-8')
            except Exception as e:
                print(f"ERROR: Could not extract icon {icon_path} from APK: {e}")
                # Don't fail the whole analysis if just the icon fails

        # Signature check
        apksigner_path = find_android_tool("apksigner.bat")
        sig_info = "No signature check performed (apksigner not found)"
        structured_sig = None
        if apksigner_path:
            sig_result = subprocess.run([apksigner_path, "verify", "--print-certs", "--verbose", file_path], capture_output=True, text=True, encoding="utf-8", errors="ignore")
            sig_info = sig_result.stdout + sig_result.stderr
            
            # Simple parsing for structured_sig
            structured_sig = {
                "valid": "Verifies" in sig_result.stdout,
                "v1": "Verified using v1 scheme (JAR signing): true" in sig_result.stdout,
                "v2": "Verified using v2 scheme (APK Signature Scheme v2): true" in sig_result.stdout,
                "v3": "Verified using v3 scheme (APK Signature Scheme v3): true" in sig_result.stdout,
                "v4": "Verified using v4 scheme (APK Signature Scheme v4): true" in sig_result.stdout,
                "certificate": "Unknown",
                "hash": "Unknown"
            }
            
            # Extract Subject and SHA-256
            for line in sig_result.stdout.splitlines():
                if line.strip().startswith("Signer #1 certificate DN:"):
                    structured_sig["certificate"] = line.split("DN:")[1].strip()
                elif line.strip().startswith("Signer #1 certificate SHA-256 digest:"):
                    structured_sig["hash"] = line.split("digest:")[1].strip()

        return {
            "success": True,
            "filename": file.filename,
            "info": info,
            "signature": sig_info,
            "structuredSig": structured_sig,
            "raw": output
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # We might want to keep the file for a bit or delete it
        # shutil.rmtree(temp_dir)
        pass

@app.get("/adb/devices")
def get_adb_devices():
    try:
        adb_path = find_android_tool("adb.exe", "platform-tools")
        if not adb_path:
            # Fallback to just "adb" incase it's in PATH
            adb_path = "adb"
            
        result = subprocess.run([adb_path, "devices"], capture_output=True, text=True)
        
        devices = []
        lines = result.stdout.strip().splitlines()
        
        # Skip the first line "List of devices attached"
        for i in range(1, len(lines)):
            line = lines[i]
            parts = line.split()
            if len(parts) >= 2:
                devices.append({
                    "serial": parts[0],
                    "status": parts[1]
                })

        return {"success": True, "output": result.stdout, "devices": devices}
    except Exception as e:
        print(f"Error executing ADB: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/adb/install")
async def install_apk(file: UploadFile = File(...)):
    temp_dir = "temp_install"
    os.makedirs(temp_dir, exist_ok=True)

    # Sanitize filename
    safe_filename = "".join([c for c in file.filename if c.isalnum() or c in "._-"]).strip()
    if not safe_filename: safe_filename = "temp_install.apk"
    
    file_path = os.path.join(temp_dir, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_path = os.path.abspath(file_path)
    
    try:
        adb_path = find_android_tool("adb.exe", "platform-tools") or "adb"
        
        # Determine target device
        devices_res = subprocess.run([adb_path, "devices"], capture_output=True, text=True)
        target_serial = None
        device_lines = devices_res.stdout.strip().splitlines()
        for i in range(1, len(device_lines)):
            line = device_lines[i]
            parts = line.split()
            if len(parts) >= 2 and parts[1] == 'device':
                target_serial = parts[0]
                break
        
        if not target_serial:
            return {"success": False, "error": "No device connected or authorized. Check ADB."}

        # Normalize adb path
        adb_path = os.path.abspath(adb_path)
        
        # Robust install flags: 
        # -r: replace, -d: downgrade, -t: test, -g: grant permissions
        cmd = [str(adb_path), "-s", str(target_serial), "install", "-r", "-d", "-t", "-g", str(file_path)]
        
        print(f"Executing: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            error_msg = result.stderr or result.stdout
            print(f"Install failed: {error_msg}")
            return {"success": False, "error": error_msg}
            
        return {"success": True, "output": result.stdout}
    except Exception as e:
        print(f"Install exception: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass


@app.post("/adb/uninstall")
async def uninstall_apk(data: dict):
    package = data.get("package")
    if not package:
        return {"success": False, "error": "No package specified"}
    try:
        adb_path = find_android_tool("adb.exe", "platform-tools") or "adb"
        
        # Determine target device
        devices_res = subprocess.run([adb_path, "devices"], capture_output=True, text=True)
        target_serial = None
        device_lines = devices_res.stdout.strip().splitlines()
        for i in range(1, len(device_lines)):
            line = device_lines[i]
            parts = line.split()
            if len(parts) >= 2 and parts[1] == 'device':
                target_serial = parts[0]
                break

        if not target_serial:
            return {"success": False, "error": "No device connected or authorized."}

        cmd = [str(adb_path), "-s", str(target_serial), "uninstall", str(package)]
        
        print(f"Executing: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            return {"success": False, "error": result.stderr or result.stdout}
        return {"success": True, "output": result.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/adb/packages")
def get_adb_packages():
    try:
        adb_path = find_android_tool("adb.exe", "platform-tools") or "adb"
        result = subprocess.run([adb_path, "shell", "pm", "list", "packages"], capture_output=True, text=True, encoding="utf-8", errors="ignore")
        if result.returncode != 0:
            print(f"ADB Error (packages): {result.stderr}")
            return {"success": False, "packages": [], "error": result.stderr}
            
        packages = []
        for line in result.stdout.splitlines():
            line = line.strip()
            if line.startswith("package:"):
                packages.append(line.replace("package:", ""))
        
        return {"success": True, "packages": sorted(packages)}
    except Exception as e:
        return {"success": False, "packages": [], "error": str(e)}

@app.get("/adb/logcat")
def get_logcat(lines: int = 500, package: Optional[str] = None):
    try:
        adb_path = find_android_tool("adb.exe", "platform-tools") or "adb"
        
        # Clear logcat first if package is provided maybe? No, just filter
        # If filtering by package:
        if package:
            # Python-side filtering to avoid 'grep' dependency on Windows
            result = subprocess.run([adb_path, "logcat", "-d", "-t", str(lines)], capture_output=True, text=True, encoding="utf-8", errors="ignore")
            filtered_lines = [line for line in result.stdout.splitlines() if package in line]
            return {"success": True, "output": "\n".join(filtered_lines)}
        else:
            result = subprocess.run([adb_path, "logcat", "-d", "-t", str(lines)], capture_output=True, text=True, encoding="utf-8", errors="ignore")
            
        return {"success": True, "output": result.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/simulator/execute")
async def execute_proxy(data: dict):
    # Proxy para evitar CORS y manejar lógica compleja de ser necesario
    url = data.get("url")
    method = data.get("method", "POST")
    payload = data.get("payload", {})
    headers = data.get("headers", {})

    try:
        if method == "GET":
            response = requests.get(url, params=payload, headers=headers, timeout=30)
        else:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        return {
            "status": response.status_code,
            "data": response.json() if "application/json" in response.headers.get("Content-Type", "") else response.text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/signer/sign")
async def sign_apk(file: UploadFile = File(...)):
    # Lógica de firma de APK
    temp_dir = "temp_signing"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Ejemplo: jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore my_application.apk alias_name
        # Aquí llamarías a tus herramientas locales
        return {"status": "success", "message": f"APK {file.filename} signed correctly (Mock)"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Limpieza (opcional)
        pass

# --- Servir Frontend ---
# Ruta para los archivos estáticos de React (CSS, JS, etc)
dist_path = os.path.join(os.path.dirname(__file__), "..", "dist")

if os.path.exists(dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(request: Request, full_path: str):
        # Si la ruta comienza con api/, no la manejamos aquí (ya están definidas arriba)
        # Esto permite que React Router maneje las rutas del lado del cliente
        file_path = os.path.join(dist_path, full_path)
        if full_path != "" and os.path.exists(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    print(f"Warning: {dist_path} not found. UI will not be served from backend.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
