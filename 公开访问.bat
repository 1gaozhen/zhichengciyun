@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title 智承瓷韵 · 一键公网访问（手机电脑无需同一网络）
echo ============================================
echo   智承瓷韵 · 一键公网访问
echo   手机和电脑无需同一网络，互联网均可访问
echo ============================================
echo.

cd /d "%~dp0"

:: ===== 1. 检查本地服务是否已启动 =====
echo [1/4] 检查本地服务 8123 端口...
set listening=0
for /f "tokens=*" %%a in ('netstat -ano ^| findstr ":8123.*LISTENING"') do set listening=1
if !listening!==0 (
    echo     本地服务未启动，正在启动 server.py ...
    start "" python "%~dp0server.py"
    timeout /t 3 >nul
    set listening=0
    for /f "tokens=*" %%a in ('netstat -ano ^| findstr ":8123.*LISTENING"') do set listening=1
    if !listening!==0 (
        echo     [!] 服务启动失败，请先运行 start.bat 确认服务正常
        pause
        exit /b
    )
)
echo     本地服务运行中: http://localhost:8123/
echo.

:: ===== 2. 检查/下载 cloudflared =====
set "CF=%~dp0cloudflared.exe"
echo [2/4] 检查内网穿透工具 cloudflared...
if exist "!CF!" (
    echo     已就绪: !CF!
) else (
    echo     未检测到 cloudflared.exe，开始下载...
    echo     下载地址: https://github.com/cloudflare/cloudflared/releases/latest
    echo.
    :: 优先使用 PowerShell 下载（兼容 Win7+）
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; $ProgressPreference='SilentlyContinue'; try { Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile '%~dp0cloudflared.exe' -UseBasicParsing } catch { Write-Host '下载失败:' $_.Exception.Message }"
    if not exist "!CF!" (
        echo     [!] 自动下载失败，请手动下载:
        echo         1. 访问: https://github.com/cloudflare/cloudflared/releases/latest
        echo         2. 下载 cloudflared-windows-amd64.exe
        echo         3. 重命名为 cloudflared.exe 放到项目根目录
        echo         4. 重新运行本脚本
        echo.
        echo     是否打开下载页？(Y/N)
        set /p ans=
        if /i "!ans!"=="Y" start "" https://github.com/cloudflare/cloudflared/releases/latest
        pause
        exit /b
    )
    echo     下载完成: !CF!
)
echo.

:: ===== 3. 启动 Cloudflare 隧道 =====
echo [3/4] 启动公网隧道...
echo     正在向 Cloudflare 申请临时公网域名，约 5-15 秒，请稍候...
echo     （此窗口需保持开启，关闭即断开公网连接）
echo.

:: 启动 quick tunnel，输出到日志文件
set "LOG=%TEMP%\cf_ciyun.log"
if exist "!LOG!" del "!LOG!"
start /min "" "!CF!" tunnel --url http://localhost:8123 --logfile "!LOG!"

:: 轮询日志提取 trycloudflare.com 地址（最多等待 30 秒）
set "public_url="
set /a wait=0
:WAITLOOP
if !wait! geq 30 goto :GETURL
timeout /t 2 >nul
set /a wait+=2
:: 优先检查 API（cloudflared metrics）
for /f "delims=" %%i in ('findstr /R /C:"https://.*trycloudflare\.com" "!LOG!" 2^>nul') do (
    set "line=%%i"
    goto :PARSE
)
goto :WAITLOOP

:PARSE
:: 从日志行中提取 trycloudflare.com URL
for /f "tokens=*" %%x in ('powershell -Command "$line='!line!'; if($line -match 'https://[a-z0-9-]+\.trycloudflare\.com'){$matches[0]}"') do set "public_url=%%x"

:GETURL
:: 兜底：从日志中再扫一次（用 PowerShell 正则，更稳）
if "!public_url!"=="" (
    for /f "delims=" %%i in ('powershell -Command "if(Test-Path '!LOG!'){$c=Get-Content '!LOG!' -Raw; if($c -match 'https://[a-z0-9-]+\.trycloudflare\.com'){$matches[0]}}"') do set "public_url=%%i"
)

:: ===== 4. 输出结果 =====
echo [4/4] 公网访问地址
echo.
echo ============================================
if not "!public_url!"=="" (
    echo.
    echo   公网访问地址: !public_url!
    echo.
    echo   将上述地址发给其他用户:
    echo     - 手机使用 4G/5G 流量也可访问
    echo     - 电脑和手机无需同一网络
    echo     - 全国乃至全球均可访问
    echo.
    echo   注意:
    echo     - 临时域名每次重启都会变化
    echo     - 关闭此窗口将断开公网连接
    echo     - 如需固定域名，需注册 Cloudflare 并配置命名隧道
    echo.
    echo   是否在浏览器打开该地址？(Y/N)
    set /p ans=
    if /i "!ans!"=="Y" start "" "!public_url!"
) else (
    echo   [!] 未能自动获取公网地址
    echo.
    echo   请手动操作:
    echo   1. 查看隧道日志: notepad "!LOG!"
    echo   2. 在日志中搜索 trycloudflare.com 找到公网地址
    echo   3. 或稍等几秒后重新运行本脚本
    echo.
    echo   是否打开日志文件查看？(Y/N)
    set /p ans=
    if /i "!ans!"=="Y" start "" notepad "!LOG!"
)
echo ============================================
echo.
echo 提示: 保持本窗口开启，公网访问才能持续
echo 按 Ctrl+C 可断开公网连接
echo.
pause
