#!/bin/bash

# 检查是否以 root 用户执行脚本
if [[ $EUID -ne 0 ]]; then
   echo "请以 root 用户身份运行脚本。"
   exit 1
fi

function install_basic_components() {
    echo "安装基础组件..."
    apt update
    apt install -y wget curl vim git build-essential
}

function install_tmux() {
    echo "安装 tmux..."
    apt install -y tmux
}

function install_docker() {
    echo "安装 Docker 和 Docker Compose..."
    apt install -y docker.io docker-compose
    systemctl enable docker
}

function install_nodejs() {
    echo "安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
    apt install -y nodejs
}

function enable_bbr() {
    echo "启用 BBR..."
    modprobe tcp_bbr
    echo "tcp_bbr" >> /etc/modules-load.d/modules.conf
    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
    sysctl -p
}

function install_oh_my_zsh() {
    echo "安装 oh-my-zsh 和 zsh-syntax-highlighting..."
    sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting
    sed -i 's/ZSH_THEME=".*"/ZSH_THEME="agnoster"/' ~/.zshrc
    echo "source ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >> ~/.zshrc
    sed -i 's/plugins=(git)/plugins=(git zsh-syntax-highlighting)/' ~/.zshrc
}

function install_rclone() {
    echo "安装 rclone 和 rclone 挂载..."
    curl https://rclone.org/install.sh | bash
    apt install -y fuse
}

function install_aria2_pro() {
    echo "安装 aria2-pro..."
    mkdir ~/aria2-pro
    cd ~/aria2-pro
    wget https://github.com/P3TERX/Aria2-Pro-Core/releases/latest/download/Aria2-Pro-Core-linux-amd64.zip
    unzip Aria2-Pro-Core-linux-amd64.zip
    chmod +x Aria2-Pro
    cp Aria2-Pro /usr/local/bin/
    cd ~
}

function install_postgresql() {
    echo "安装 PostgreSQL 通过 Docker Compose..."
    echo "version: '3'

services:
  postgres:
    image: postgres:latest
    container_name: postgres
    restart: always
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
    volumes:
      - ./pgdata:/var/lib/postgresql/data
    ports:
      - \"8086:5432\"" > docker-compose.yml

    docker-compose up -d
}

function main_menu() {
    while true; do
        echo "请选择要执行的操作:"
        echo "1. 安装基础组件"
        echo "2. 安装 tmux"
        echo "3. 安装 Docker 和 Docker Compose"
        echo "4. 安装 Node.js"
        echo "5. 启用 BBR"
        echo "6. 安装 oh-my-zsh 和 zsh-syntax-highlighting"
        echo "7. 安装 rclone 和 rclone 挂载"
        echo "8. 安装 aria2-pro"
        echo "9. 安装 PostgreSQL 通过 Docker Compose"
        echo "0. 退出"

        read -p "请输入选择的操作: " choice

        case $choice in
            1) install_basic_components ;;
            2) install_tmux ;;
            3) install_docker ;;
            4) install_nodejs ;;
            5) enable_bbr ;;
            6) install_oh_my_zsh ;;
            7) install_rclone ;;
            8) install_aria2_pro ;;
            9) install_postgresql ;;
            0) exit ;;
            *) echo "无效的选择." ;;
        esac
    done
}

main_menu
