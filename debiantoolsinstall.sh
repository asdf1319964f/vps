#!/bin/bash

# 定义函数：安装 pikpak-webdav
function install_pikpak_webdav {
    read -p "pikpak-webdav: " file newname
    docker run --restart=always --name=pikpak-webdav \
        --restart=unless-stopped \
        --network=host \
        -v /etc/localtime:/etc/localtime \
        -e TZ="Asia/Shanghai" \
        -e JAVA_OPTS="-Xmx512m" \
        -e SERVER_PORT="8080" \
        -e PIKPAK_USERNAME="asdf131996455@gmail.com" \
        -e PIKPAK_PASSWORD="1319964f" \
        -e PIKPAK_PROXY_HOST="" \
        -e PIKPAK_PROXY_PORT="" \
        -e PIKPAK_PROXY_PROXY-TYPE="HTTP/SOCKS/DIRECT" \
        vgearen/pikpak-webdav
}

# 定义函数：配置 bbr
function configure_bbr {
    read -p "bbr: " old_file new_file
    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
    sysctl -p
}

# 定义函数：安装 Docker
function install_docker {
    rm /etc/apt/sources.list
    wget https://raw.githubusercontent.com/asdf1319964f/vps/master/source.list
    apt update
    wget 
    apt install apt-transport-https ca-certificates curl gnupg2 software-properties-common
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
    apt update
    apt install docker-ce
    rm -f /etc/ssl/certs/ca-bundle.crt
    apt reinstall ca-certificates
    update-ca-certificates
}

# 定义函数：安装 zfile
function install_zfile {
    docker run --restart=always --name=zfile \
        -p 8080:8080 \
        -v /root/zfile/conf:/root/.zfile-v4 \
        -v /root/zfile/data:/root/zfile/data \
        stilleshan/zfile
}

# 定义函数：安装 unblockneteasemusic
function install_unblockneteasemusic {
    docker run --restart=always --name unmusic -d -p 1800:8080 nondanee/unblockneteasemusic
}

# 定义函数：安装 aria2-pro
function install_aria2_pro {
    docker pull p3terx/aria2-pro
    docker run -d \
        --name aria2-pro \
        --restart unless-stopped \
        --log-opt max-size=1m \
        --network host \
        -e PUID=$UID \
        -e PGID=$GID \
        -e RPC_SECRET=1319964f \
        -e RPC_PORT=6800 \
        -e LISTEN_PORT=6888 \
        -e SPECIAL_MODE=rclone \
        -v ~/aria2:/config \
        -v /mnt/256/down:/downloads \
        -v ~/aria2/complted:/complted \
        -e SPECIAL_MODE=rclone \
        p3terx/aria2-pro
}

# 定义函数：安装 emby
function install_emby {
    docker run --name=emby -d \
        -v /root/emby/config:/config \
        -v /home/acg:/mnt/share1 \
        -v /home/one:/mnt/share2 \
        -p 8096:8096 \
        -p 2053:2053 \
        -e UID=1000 \
        -e GID=100 \
        -e GIDLIST=100 \
        --restart unless-stopped \
        zishuo/embyserver
}

# 定义函数：安装 watchtower
function install_watchtower {
    docker run -d \
        --name watchtower \
        --restart unless-stopped \
        -v /var/run/docker.sock:/var/run/docker.sock \
        containrrr/watchtower \
        --cleanup
}

# 定义函数：运行 bench.sh
function run_bench {
    wget -qO- bench.sh | bash
}

# 定义函数：更新系统并安装常用工具
function update_and_install_tools {
    apt update && apt upgrade && apt install wget curl git net-tools nano screen tsu
}

# 定义函数：安装 rclone
function install_rclone {
    curl https://rclone.org/install.sh | bash
}

# 定义函数：安装 Aria2-Pro UI
function install_aria2_pro_ui {
    curl -fsSL "https://alist.nn.ci/v3.sh" | bash -s install
}

# 显示菜单选项
function show_menu {
    echo "选择要执行的操作："
    echo "1. 安装 pikpak-webdav"
    echo "2. 配置 bbr"
    echo "3. 安装 Docker"
    echo "4. 安装 zfile"
    echo "5. 安装 unblockneteasemusic"
    echo "6. 安装 aria2-pro"
    echo "7. 安装 emby"
    echo "8. 安装 watchtower"
    echo "9. 运行 bench.sh"
    echo "10. 更新系统并安装常用工具"
    echo "11. 安装 rclone"
    echo "12. 安装 Aria2-Pro UI"
    echo "0. 退出"
}

# 处理用户输入的选项
function handle_option {
    read -p "请输入选项数字: " option
    case $option in
        1)
            install_pikpak_webdav
            ;;
        2)
            configure_bbr
            ;;
        3)
            install_docker
            ;;
        4)
            install_zfile
            ;;
        5)
            install_unblockneteasemusic
            ;;
        6)
            install_aria2_pro
            ;;
        7)
            install_emby
            ;;
        8)
            install_watchtower
            ;;
        9)
            run_bench
            ;;
        10)
            update_and_install_tools
            ;;
        11)
            install_rclone
            ;;
        12)
            install_aria2_pro_ui
            ;;
        0)
            exit 0
            ;;
        *)
            echo "无效的选项"
            ;;
    esac
}

# 主循环
while true; do
    show_menu
    handle_option
    echo
done
