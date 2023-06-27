#!/bin/bash

# 安装必要的软件包
function install_packages {
  echo "正在安装必要的软件包..."
  apt-get update
  apt-get install -y p7zip p7zip-full p7zip-rar unzip unar unrar
}

# 定义函数：解压 .rar 文件
function extract_rar {
  read -p "请输入解压密码: " rar_password
  find /mnt/128/downloads/p/ -name "*.rar" -execdir unrar x -p"$rar_password" -o+ {} \;
  find /mnt/128/downloads/p/ -name "*.7z.001" -execdir 7z x -p$rar_password {} \;
}

# 定义函数：删除指定文件类型
function delete_files {
  find /mnt/128/downloads/p/ \( -name "*.txt" -o -name "*.url" -o -name "*.rar" -o -name "*.zip" -o -name "*.7z" \) -exec rm -rf {} \;
}

# 定义函数：解压 .zip 文件
function extract_zip {
  read -p "请输入解压密码: " zip_password
  find /mnt/128/downloads/p/ -name "*.zip" -execdir unzip -P "$zip_password" {} \;
}

# 定义函数：解压 .7z 文件
function extract_7z {
  read -p "请输入解压密码: " _7z_password
  find /mnt/128/downloads/p/ -name "*.7z" -execdir 7z x -p"$_7z_password" {} \;
}

# 显示菜单选项
function show_menu {
  echo "选择要执行的操作："
  echo "1. 安装必要的软件包"
  echo "2. 解压 .rar 分卷包和 .7z 分卷包"
  echo "3. 删除指定文件类型"
  echo "4. 解压 .zip 分卷包"
  echo "5. 清空目录中的所有文件"
  echo "6. 删除指定目录"
  echo "0. 退出"
}

# 处理用户输入的选项
function handle_option {
  read -p "请输入选项数字: " option
  case $option in
    1)
      install_packages
      ;;
    2)
      extract_rar
      ;;
    3)
      delete_files
      ;;
    4)
      extract_zip
      ;;
    5)
      clear_directory
      ;;
    6)
      delete_directory
      ;;
    0)
      exit 0
      ;;
    *)
      echo "无效的选项"
      ;;
  esac
}

# 清空目录中的所有文件
function clear_directory {
  find /mnt/128/downloads/p/ -type f -exec rm -f {} \;
}

# 删除指定目录
function delete_directory {
  find /mnt/128/downloads/p/ -name "*国产无码*" -exec rm -rf {} \;
}

# 主循环
while true; do
  show_menu
  handle_option
  echo
done
