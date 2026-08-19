# 智承瓷韵 · Docker 镜像（仅 Python 标准库，镜像极小）
FROM python:3.11-slim

# 设置时区与编码
ENV TZ=Asia/Shanghai \
    PYTHONUNBUFFERED=1 \
    PYTHONIOENCODING=utf-8

WORKDIR /app

# 先复制依赖声明（利用缓存层）
COPY requirements.txt ./

# 复制项目全部文件（含 index.html、server.py、纹样wy 图片资源）
COPY . /app

# 暴露端口（与 PORT 环境变量保持一致）
EXPOSE 8123

# 启动后端服务（同时 serve 静态前端）
CMD ["python", "server.py"]
