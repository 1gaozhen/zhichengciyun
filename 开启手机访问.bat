@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title 智承瓷韵 · 手机访问一键配置
echo ============================================
echo   智承瓷韵 · 手机访问一键配置
echo ============================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] 需要管理员权限，5 秒后自动提权弹窗...
    timeout /t 5 >nul
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo [1/3] 添加防火墙规则（允许 8123 端口入站）...
netsh advfirewall firewall delete rule name="瓷韵8123" >nul 2>&1
netsh advfirewall firewall add rule name="瓷韵8123" dir=in action=allow protocol=TCP localport=8123 >nul 2>&1
if %errorLevel% equ 0 (
    echo     防火墙规则已添加
) else (
    echo     防火墙规则添加失败，请手动放行 8123 端口
)
echo.

echo [2/3] 获取本机局域网 IP...
for /f "delims=" %%i in ('powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' -and $_.PrefixOrigin -ne 'WellKnown'} | Select-Object -First 1).IPAddress"') do set ip=%%i
if "!ip!"=="" (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
        set ip=%%a
        set ip=!ip: =!
        if not "!ip!"=="" goto gotip
    )
)
:gotip
if "!ip!"=="" (
    echo     未找到可用 IP，请检查网络连接
    pause
    exit /b
)
echo     本机局域网 IP: !ip!
echo.

echo [3/3] 检查 8123 端口监听状态...
set listening=0
for /f "tokens=*" %%a in ('netstat -ano ^| findstr ":8123.*LISTENING"') do (
    echo     %%a
    set listening=1
)
if !listening!==0 (
    echo     [!] 8123 端口未监听，请先运行 start.bat 或 python server.py 启动服务
    echo.
    echo     是否现在启动服务器？(Y/N)
    set /p ans=
    if /i "!ans!"=="Y" (
        start "" python "%~dp0server.py"
        timeout /t 2 >nul
    )
)
echo.

echo ============================================
echo.
echo   配置完成！
echo.
echo   手机访问地址: http://!ip!:8123/
echo.
echo   操作步骤:
echo   1. 确保手机与电脑连接同一 WiFi
echo   2. 在手机浏览器地址栏输入上述地址
echo   3. 或扫描项目中的二维码图片访问
echo.
echo ============================================
echo.
pause
