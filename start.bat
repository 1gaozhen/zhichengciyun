@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === 智承瓷韵 启动中 ===
python server.py
pause
