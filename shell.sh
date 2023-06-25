#!/bin/bash

# 定义函数：解压 .rar 文件
function extract_rar {
  find /mnt/128/downloads/p/ -name "*.rar" -execdir unrar x -p"av783661" -o+ {} \;
}

# 定义函数：删除指定文件类型
function delete_files {
  find /mnt/128/downloads/p/ \( -name "*.txt" -o -name "*.url" -o -name "*.rar" -o -name "*.zip" \) -exec rm -rf {} \;
}

# 定义函数：解压 .zip 文件
function extract_zip {
  find /mnt/128/downloads/p/ -name "*.zip" -execdir unar -e GBK  -p "av783661" {} \;
}

# 定义函数：清空目录中的所有文件
function clear_directory {
  find /mnt/128/downloads/p/ -type f -exec rm -f {} \;
}

# 定义函数：删除指定目录
function delete_directory {
  find /mnt/128/downloads/p/ -name "*国产无码*" -exec rm -rf {} \;
}

# 显示菜单选项
function show_menu {
  echo "选择要执行的操作："
  echo "1. 解压 .rar 文件"
  echo "2. 删除指定文件类型"
  echo "3. 解压 .zip 文件"
  echo "4. 清空目录中的所有文件"
  echo "5. 删除指定目录"
  echo "0. 退出"
}

# 处理用户输入的选项
function handle_option {
  read -p "请输入选项数字: " option
  case $option in
    1)
      extract_rar
      ;;
    2)
      delete_files
      ;;
    3)
      extract_zip
    
