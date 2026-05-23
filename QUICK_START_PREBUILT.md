# 快速启动指南（已有 Jar 包版）

如果您已经获取了编译好的 `.jar` 文件，则无需再次配置 Maven 环境和编译源码。只需按照以下步骤即可快速启动服务。

## 1. 准备工作

确保您的运行环境满足以下条件：
- **Java 21 运行时 (JRE 或 JDK)**：必须是 Java 21。
- **PostgreSQL 数据库**：服务正在运行，且已创建 `worldone` 数据库。
- **获取 Jar 包**：确保您拥有 `world-one-1.0-SNAPSHOT.jar` 和 `memory-one-1.0-SNAPSHOT.jar`。

## 2. 设置数据库信息与模型信息

编辑start-all.sh，将正确信息填写到脚本中

## 3.启动服务

运行脚本启动服务

完成后，访问 `http://localhost:8090` 即可开始使用。
