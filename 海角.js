// ==UserScript==
// @name         海角vip解析下载
// @namespace    http://www.djyun.icu/
// @version      0.1
// @description  Download video from specific pages
// @include      https://*/post/details*
// @match        https://*/post/details*
// @require      https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js
// @require      https://cdn.jsdelivr.net/npm/hls.js@latest
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

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
        let url = response.data;
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

    })
    .catch(function(error) {
        console.error(error);
    });
})();
