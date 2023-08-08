#!/bin/bash

# 安装所需软件
sudo apt-get update
sudo apt-get install p7zip p7zip-full p7zip-rar unzip unar unrar

# 显示解压选项菜单
echo "请选择操作:"
echo "1. 解压zip文件"
echo "2. 解压tar文件"
echo "3. 解压7z文件"
echo "4. 解压rar文件"
echo "5. 退出"

read choice

case $choice in
    1)
        echo "请输入zip文件路径:"
        read zip_path

        echo "是否是分卷包？(y/n)"
        read is_split
        if [ "$is_split" == "y" ]; then
            echo "请输入分卷包序号（例如：'file.zip.001' 输入 '001'）:"
            read split_num
            unzip $zip_path.$split_num -d extracted_files
        else
            echo "请输入解压目录:"
            read extract_dir
            unzip $zip_path -d $extract_dir
        fi
        ;;
    2)
        echo "请输入tar文件路径:"
        read tar_path

        echo "是否有密码保护？(y/n)"
        read has_password
        if [ "$has_password" == "y" ]; then
            echo "请输入密码:"
            read password
            tar -xvf $tar_path -C extracted_files --password=$password
        else
            echo "请输入解压目录:"
            read extract_dir
            tar -xvf $tar_path -C $extract_dir
        fi
        ;;
    3)
        echo "请输入7z文件路径:"
        read sevenz_path

        echo "是否有密码保护？(y/n)"
        read has_password
        if [ "$has_password" == "y" ]; then
            echo "请输入密码:"
            read password
            7za x $sevenz_path -oextracted_files -p$password
        else
            echo "请输入解压目录:"
            read extract_dir
            7za x $sevenz_path -o$extract_dir
        fi
        ;;
    4)
        echo "请输入rar文件路径:"
        read rar_path

        echo "是否有密码保护？(y/n)"
        read has_password
        if [ "$has_password" == "y" ]; then
            echo "请输入密码:"
            read password
            unrar x $rar_path extracted_files -p$password
        else
            echo "请输入解压目录:"
            read extract_dir
            unrar x $rar_path $extract_dir
        fi
        ;;
    5)
        exit 0
        ;;
    *)
        echo "无效的选项"
        ;;
esac
