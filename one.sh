#!/bin/bash
#zonghe
usage(){
case $choice in
1)
read -p "bbr: " old_file new_file
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
if [ $? -eq 0 ];then
    echo "success!" >&2
fi    
     sleep 2
;;


2)
read -p "pikpak-webdav : " file newname
docker run -d \
--name=pikpak-webdav \
--restart=unless-stopped \
--network=host \
-v /etc/localtime:/etc/localtime \
-e TZ="Asia/Shanghai" \
-e JAVA_OPTS="-Xmx512m" \
-e SERVER_PORT="8080" \
-e PIKPAK_USERNAME="asdf131996455@gmail.com" \
-e PIKPAK_PASSWORD="1319964f" \
-e PIKPAK_PROXY_HOST="" \
-e PIKPAK_PROXY_PORT="" 和\
-e PIKPAK_PROXY_PROXY-TYPE="HTTP/SOCKS/DIRECT"  \
vgearen/pikpak-webdav
if [ $? -eq 0 ] ;then
    echo "success!" >&2
fi    
sleep 2
;;


3)
read -p "Docker : " filename
apt install apt-transport-https ca-certificates curl gnupg2 software-properties-common
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
apt update
apt install docker-ce
if [ $? -eq 0 ];then
    echo "success!" >&2
fi    
sleep 2
;;

3)
read -p "修复SSL : " filename
rm -f /etc/ssl/certs/ca-bundle.crt
apt reinstall ca-certificates
update-ca-certificates
if [ $? -eq 0 ];then
    echo "success!" >&2
fi    
sleep 2
;;

5)
read -p "zfile : " filename
docker run -d --name=zfile --restart=always \
    -p 8080:8080 \
    -v /root/zfile/conf:/root/.zfile-v4 \
    -v /root/zfile/data:/root/zfile/data \
    stilleshan/zfile

if [ $? -eq 0 ];then
    echo "success!" >&2
fi    
sleep 2


read -p "Docker-Compose : " filename
curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
 ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

if [ $? -eq 0 ];then
    echo "success!" >&2
fi    
sleep 2
;;
7)
read -p "Cloud Music: " filename
docker run --restart=always --name unmusic -d -p 1800:8080 nondanee/unblockneteasemusic

if [ $? -eq 0 ];then
    echo "success!" >&2
fi    
sleep 2
;;

8)
read -p "Aria2-pro : " filename
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
if [ $? -eq 0 ];then
    echo "success!" >&2
fi    
sleep 2
;;

9)
read -p "EMBY INSTALL  : " filename
docker run --name=emby -d 
-v /root/emby/config:/config   
-v /home/acg:/mnt/share1 
-v /home/one:/mnt/share2     
-p 8096:8096  
-p 2053:2053  
-e UID=1000  
-e GID=100  
-e GIDLIST=100
 --restart unless-stopped  
zishuo/embyserver 
*
if [ $? -eq 0 ];then
    echo "success!" >&2
fi    
sleep 2
;;
10)
read -p "docker容器自动更新: " filename
docker run -d \
    --name watchtower \
    --restart unless-stopped \
    -v /var/run/docker.sock:/var/run/docker.sock \
    containrrr/watchtower \
    --cleanup
if [ $? -eq 0 ];then
    echo "success!" >&2
fi    
sleep 2
;;
11)
read -p "一键测速speedtest: " filename
wget -qO- bench.sh | bash
if [ $? -eq 0 ];then
    echo "success!" >&2
fi    
sleep 2

;;
12)
read -p "apt一键安装基础包: " filename
apt update && apt upgrade && apt install wget curl git net-tools nano screen
if [ $? -eq 0 ];then
    echo "success!" >&2
fi
sleep2
;;

13)
read -p "一键安装Rclone: " filename
curl https://rclone.org/install.sh | sudo bash
if [ $? -eq 0 ];then
    echo "success!" >&2
fi
sleep2
;;

14)
read -p "一键安装alist: " filename
docker run -d --restart=always -v /etc/alist:/opt/alist/data -p 80:5244 --name="alist" xhofe/alist:latest
if [ $? -eq 0 ];then
    echo "success!" >&2
fi
sleep2
;;



15)
exit 0
;;

*)
;;




esac

}


while :

do

cat<<EOF 
_________________________________________
|                DEBIAN10一键安装脚本     |

|   1.bbr                2.pikpak-webdav|

|   3.docker             4.修复ssl报错    |
   
|   5.一键安装zfile                       |
  
|   6.一键安装docker-compose              | 
    
|   7.一键搭建网易云解析                    |    
     
|   8.一键搭建aria2-pro                   |    
    
|   9.一键安装EMBY                        |   
    
|   10.一键更新Docker容器                  |   
    
|   11.一键测速                           |       

|   12.一键安装基础包                      |

|   13.一键安装Rclone                          |

|   14.一键安装alist 

   15.EXIT
|________________________________________|
EOF
 

read -p "请选择要使用的选项 : " choice

usage

done
