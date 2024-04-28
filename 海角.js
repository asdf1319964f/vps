// ==UserScript==
// @name         海角vip解析下载
// @namespace    http://www.djyun.icu/
// @version      0.2
// @description  从特定页面下载视频
// @include      https://*/post/details*
// @match        https://*/post/details*
// @require      https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js
// @require      https://cdn.jsdelivr.net/npm/hls.js@latest
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 生成随机User-Agent字符串的函数
    function getRandomUA() {
        const uas = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.9999.999 Safari/537.36',
            // 根据需要添加更多User-Agent字符串
        ];
        return uas[Math.floor(Math.random() * uas.length)];
    }

    // 生成随机IP地址的函数
    function getRandomIP() {
        const segments = [];
        for (let i = 0; i < 4; i++) {
            segments.push(Math.floor(Math.random() * 256));
        }
        return segments.join('.');
    }

    // 设置随机User-Agent
    axios.defaults.headers.common['User-Agent'] = getRandomUA();

    // 设置随机IP地址（伪装）
    axios.defaults.headers.common['X-Forwarded-For'] = getRandomIP();
    axios.defaults.headers.common['X-Remote-IP'] = getRandomIP();
    axios.defaults.headers.common['X-Remote-Addr'] = getRandomIP();

    // 页面全文展开函数
    function expandFullPost() {
        const targetText = '点击展开完整贴文';
        const elements = Array.from(document.querySelectorAll('p, a, button, div'));
        const expandElement = elements.find(element => element.textContent.includes(targetText));

        if(expandElement) {
            expandElement.click();
        }
    }

    // 从URL获取参数
    let params = new URLSearchParams(window.location.search);
    let id = params.get('pid');
    let reloadCount = params.get('reload') || 0;

    if (!id) return;

    // 请求M3U8视频地址
    axios.get('http://www.djyun.icu/api/hjjx?id=' + id)
    .then(function(response) {
        let content = response.data;

        // 创建一个正则表达式来匹配所有的.m3u8链接
        let reg = /(https?:\/\/[^\s]*\.m3u8)/g;

        // 使用正则表达式从响应内容中找出所有的链接
        let urls = content.match(reg);

        // 如果找到了链接，执行以下操作
        if (urls) {
            urls.forEach(url => {
                console.log(url);

                // 自动展开完整贴文
                expandFullPost();

                //显示播放链接地址
                let urlDisplay = document.createElement('p');
                urlDisplay.innerText = '播放链接地址: ' + url;
                urlDisplay.style.position = 'fixed';
                urlDisplay.style.top = '50px';
                urlDisplay.style.right = '50px';
                urlDisplay.style.zIndex = '9999';
                document.body.appendChild(urlDisplay);

                // 创建下载链接
                let downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = '';
                downloadLink.style.display = 'none';
                document.body.appendChild(downloadLink);

                // 创建下载按钮，点击时触发下载操作
                let downloadButton = document.createElement('button');
                downloadButton.textContent = "下载视频";
                downloadButton.style.position = 'fixed';
                downloadButton.style.top = '80px';
                downloadButton.style.right = '10px';
                downloadButton.style.zIndex = '9999';
                downloadButton.onclick = function() {
                    downloadLink.click();
                };
                document.body.appendChild(downloadButton);

                // 使用hls.js播放器播放视频
                var video = document.createElement('video');
                video.controls = true;
                var hls = new Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED,function() {
                    video.play();
                });
                video.style.position = 'fixed';
                video.style.bottom = '10px';
                video.style.right = '10px';
                video.style.width = '480px';
                video.style.height = '270px';
                video.style.zIndex = '9999';
                document.body.appendChild(video);
            });
        } else {
            console.log('No M3U8 links found.');
        }
    })
    .catch(function(error) {
        console.error(error);
    });

})();
