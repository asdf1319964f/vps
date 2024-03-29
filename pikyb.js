// 本脚本为js脚本，请在Node.js环境中运行，可挂载青龙或本地运行。
// 本脚本需安装库 安装方法：npm install axios ，npm install crypto ，npm install cheerio ，npm install imap 青龙面板搜索库名进行安装
// 本脚本邮箱API为outlook邮箱或者gmail邮箱，需要先在邮箱中开启第三方登录，并获取授权码，具体方法请自行搜索
// 78行host服务器地址请根据自己邮箱进行更改，outlook邮箱服务器地址：outlook.office365.com ， gmail邮箱服务器地址：imap.gmail.com

const invite_code = '98668536';// 这里修改自己的邀请码
const email = 'asdf131996455@outlook.com' // 这里改自己的outlook或者gmail邮箱
const password = 'tohrdrcfdqmjoatm' // 这里改自己的outlook或者gmail第三方登录授权密码
const Imap = require('imap');
const cheerio = require('cheerio');
const axios = require('axios');
const hashlib = require('crypto');
const parts = email.split('@');
const username = parts[0]; // 分割后的第一部分
const domain = parts[1]; // 分割后的第二部分
const randomSuffix = Math.floor(Math.random() * 999999999) + 1;
const mail = `${username}+${randomSuffix}@${domain}`;
console.log(`获取邮箱地址:${mail}`)


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getUAKey() {
    const g = xid + "com.pikcloud.pikpak1appkey";
    const sha1 = hashlib.createHash('sha1');
    sha1.update(g, 'utf-8');
    const f = sha1.digest('hex');
    const md5_hash = hashlib.createHash('md5');
    md5_hash.update(f, 'utf-8');
    const h = md5_hash.digest('hex');
    return xid + h;
}

function getUserAgent(key) {
    return `ANDROID-com.pikcloud.pikpak/1.38.0 protocolversion/200 accesstype/ clientid/${client} clientversion/1.38.0 action_type/ networktype/WIFI sessionid/ deviceid/${xid} providername/NONE devicesign/div101.${key} refresh_token/ sdkversion/1.1.0.110000 datetime/${t} usrno/ appname/android-com.pikcloud.pikpak session_origin/ grant_type/ appid/ clientip/ devicename/${deviceName}_${deviceModel} osversion/13 platformversion/10 accessmode/ devicemodel/${deviceModel}`;
}

function getSign() {
    const e = [
        {alg: 'md5', salt: 'Z1GUH9FPdd2uR48'},
        {alg: 'md5', salt: 'W4At8CN00YeICfrhKye'},
        {alg: 'md5', salt: 'WbsJsexMTIj+qjuVNkTZUJxqUkdf'},
        {alg: 'md5', salt: 'O56bcWMoHaTXey5QnzKXDUETeaVSD'},
        {alg: 'md5', salt: 'nAN3jBriy8/PXGAdsn3yPMU'},
        {alg: 'md5', salt: '+OQEioNECNf9UdRe'},
        {alg: 'md5', salt: '2BTBxZ3IbPnkrrfd/'},
        {alg: 'md5', salt: 'gBip5AYtm53'},
        {alg: 'md5', salt: '9FMyrvjZFZJT5Y+b1NeSYfs5'},
        {alg: 'md5', salt: '0cIBtEVWYCKdIOlOXnTJPhLGU/y5'},
        {alg: 'md5', salt: '92j4I+ZiMyxFx6Q'},
        {alg: 'md5', salt: 'xNFN9RnUlu218s'},
        {alg: 'md5', salt: 'UZcnnQ2nkaY0S'}
    ];
    let md5_hash = `YNxT9w7GMdWvEOKa1.38.0com.pikcloud.pikpak${xid}${t}`;
    e.forEach(item => {
        md5_hash += item.salt;
        md5_hash = hashlib.createHash('md5').update(md5_hash).digest('hex');
    });

    return md5_hash;
}



async function getCode(result) {
    const captcha = result.captcha;
    const verificationId = result.verificationId;
        // 创建 IMAP 连接
    const imap = new Imap({
        user: email,
        password: password,
        host: 'outlook.office365.com', // 如gmail请改为 imap.gmail.com
        port: 993,
        tls: true
    });

    // 连接到邮箱服务器
    await new Promise((resolve, reject) => {
        imap.once('ready', resolve);
        imap.once('error', reject);
        imap.connect();
    });
    console.log('已连接邮箱服务器');

    // 登录邮箱
    const openInbox = await new Promise((resolve, reject) => {
        imap.openBox('INBOX', false, (err, mailbox) => {
            if (err) reject(err);
            else resolve(mailbox);
        });
    });
    console.log('邮箱登陆成功');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // 搜索最新的一封邮件
    const messages = await new Promise((resolve, reject) => {
        const searchCriteria = ['ALL'];
        imap.search(searchCriteria, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });

    if (messages.length > 0) {
        console.log('接到新邮件');

        // 获取最新的邮件
        const message = await new Promise((resolve, reject) => {
            const fetch = imap.fetch(messages[messages.length - 1], { bodies: '' });
            let body = '';
            fetch.on('message', (msg) => {
                msg.on('body', (stream) => {
                    stream.on('data', (chunk) => {
                        body += chunk.toString('utf8');
                    });
                });
                msg.once('end', () => {
                    resolve(body);
                });
            });
            fetch.once('error', reject);
        });

        // 解析邮件内容
        const $ = cheerio.load(message);
        const code = $('h2').text().trim();
        if (code.length === 6 && /^\d+$/.test(code)) {
            console.log(`验证码:${code}`);
            return {code, captcha, verificationId};
        }
    }

    console.log('没有新邮件');
    imap.end();
    return null;
}
async function init() {
    const url = "https://user.mypikpak.com/v1/shield/captcha/init";
    const params = {"client_id": client};
    const json_data = {
        "action": "POST:/v1/auth/verification",
        "captcha_token": '',
        "client_id": client,
        "device_id": xid,
        "meta": {
            "captcha_sign": "1." + sign,
            "user_id": "",
            "package_name": "com.pikcloud.pikpak",
            "client_version": "1.38.0",
            "email": mail,
            "timestamp": t
        },
        "redirect_uri": "xlaccsdk01://xbase.cloud/callback?state=harbor"
    };
    const headers = {"X-Device-Id": xid, "User-Agent": ua};
    try {
        const response = await axios.post(url, json_data, {params, headers});
        const captcha = response.data['captcha_token'];
        console.log('注册验证');
        return {mail, captcha};
    } catch (error) {
        console.error('注册验证失败:', error);
        throw error;
    }
}

function item_compare(img_list, mode_list) {
    let score = 0;
    let rank = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (img_list[i][j] !== mode_list[i][j]) {
                score += 1;
            }
        }
    }
    if (score === 2) {
        rank += 1;
    }
    return rank;
}

function list_compare(frames) {
    let score_list = [];
    let flag = 0;
    for (const frame of frames) {
        const img_list = frame.matrix;
        let scores = 0;
        for (const mode_frame of frames) {
            const mode_list = mode_frame.matrix;
            const one_score = item_compare(img_list, mode_list);
            scores += one_score;
        }
        score_list.push(scores);
        flag += 1;
    }
    for (let i = 0; i < 12; i++) {
        if (score_list[i] === 11) {
            // console.log(i)
            return i;
        }
    }
}

async function getImage(result) {
    const captcha = result.captcha;
    const url = "https://user.mypikpak.com/pzzl/gen";
    const params = {
        "deviceid": xid,
        "traceid": ""
    };
    try {
        const response = await axios.get(url, {params});
        const imgsJson = response.data;
        // console.log(imgsJson);
        const goalLists = imgsJson["frames"];
        const pid = imgsJson['pid'];
        const traceid = imgsJson['traceid'];
        const selectId = list_compare(goalLists);
        const result2 = {imgsJson, pid, traceid, selectId};
        console.log('获取滑动次数:', result2.selectId);
        return {mail, result2, captcha};
    } catch (error) {
        console.error('获取滑块图形失败:', error);
        throw error;
    }
}

function r(e, t) {
    let n = t - 1;
    if (n < 0) {
        n = 0;
    }
    let r = e[n];
    let u = Math.floor(r['row'] / 2) + 1;
    let c = Math.floor(r['column'] / 2) + 1;
    let f = r['matrix'][u][c];
    let l = t + 1;
    if (l >= e.length) {
        l = t;
    }
    let d = e[l];
    let p = l % d['row'];
    let h = l % d['column'];
    let g = d['matrix'][p][h];
    let y = e[t];
    let m = 3 % y['row'];
    let v = 7 % y['column'];
    let w = y['matrix'][m][v];
    let b = parseInt(i(f)) + o(w);
    let x = parseInt(i(w)) - o(f);
    return [s(a(i(f), o(f))), s(a(i(g), o(g))), s(a(i(w), o(w))), s(a(b, x))];
}

function i(e) {
    return parseInt(e.split(",")[0]);
}

function o(e) {
    return parseInt(e.split(",")[1]);
}

function a(e, t) {
    return e + "^⁣^" + t;
}

function s(e) {
    let t = 0;
    let n = e.length;
    for (let r = 0; r < n; r++) {
        t = u(31 * t + e.charCodeAt(r));
    }
    return t;
}

function u(e) {
    let t = -2147483648;
    let n = 2147483647;
    if (e > n) {
        return t + (e - n) % (n - t + 1) - 1;
    }
    if (e < t) {
        return n - (t - e) % (n - t + 1) + 1;
    }
    return e;
}

function c(e, t) {
    return s(e + "⁣" + t);
}

function img_jj(e, t, n) {
    return {
        'ca': r(e, t),
        'f': c(n, t)
    };
}

async function getNewToken(result1) {
    const ff = result1.result2
    const captcha = result1.captcha
    const frames = ff.imgsJson.frames
    const selectId = ff.selectId
    const traceid = ff.traceid
    const pid = ff.pid
    const result = img_jj(frames, parseInt(selectId), pid);
    const f = result.f;
    const npac = result.ca;
    const params = {
        pid: pid,
        deviceid: xid,
        traceid: traceid,
        f: f,
        n: npac[0],
        p: npac[1],
        a: npac[2],
        c: npac[3]
    };
    const session = axios.create({
        baseURL: 'https://user.mypikpak.com',
    });
    const res1 = await session.get('/pzzl/verify', {params});
    const res2 = await session.get('/credit/v1/report', {
        params: {
            deviceid: xid,
            captcha_token: captcha,
            type: 'pzzlSlider',
            result: '0',
            data: pid,
            traceid: traceid,
        }
    });
    const newToken = res2.data.captcha_token;
    console.log(`验证滑块成功`);
    if (newToken) {
        return {mail, newToken};

    }
}

async function verification(result) {
    const captcha = result.newToken
    const url = 'https://user.mypikpak.com/v1/auth/verification';
    const params = {client_id: client};
    const jsonData = {
        captcha_token: captcha,
        email: mail,
        locale: 'zh-CN',
        target: 'ANY',
        client_id: client
    };
    const headers = {'X-Device-Id': xid, 'User-Agent': ua};
    Object.assign(headers, basicRequestHeaders_1);
    const response = await axios.post(url, jsonData, {headers, params});
    const verificationId = response.data.verification_id;
    console.log(`发送验证码`);
    return {verificationId, captcha};
}

async function verify(result) {
    const code = result.code
    const captcha = result.captcha
    const verificationId = result.verificationId
    const url = 'https://user.mypikpak.com/v1/auth/verification/verify';
    const params = {client_id: client};
    const jsonData = {
        client_id: client,
        verification_id: verificationId,
        verification_code: code
    };
    const headers = {'X-Device-Id': xid, 'User-Agent': ua};
    Object.assign(headers, basicRequestHeaders_1);
    const response = await axios.post(url, jsonData, {headers, params});
    const verificationToken = response.data.verification_token;
    console.log(`验证验证码`);
    return {verificationToken, captcha};
}

async function init1(result) {
    const verificationToken = result.verificationToken
    const captcha = result.captcha
    const url = 'https://user.mypikpak.com/v1/shield/captcha/init';
    const params = {client_id: client};
    const jsonData = {
        action: 'POST:/v1/auth/signup',
        captcha_token: captcha,
        client_id: client,
        device_id: xid,
        meta: {
            captcha_sign: `1.${sign}`,
            user_id: '',
            package_name: 'com.pikcloud.pikpak',
            client_version: '1.38.0',
            email: mail,
            timestamp: t
        },
        redirect_uri: 'xlaccsdk01://xbase.cloud/callback?state=harbor'
    };
    const headers = {
        Host: 'user.mypikpak.com',
        'x-device-id': xid,
        'user-agent': ua,
        'accept-language': 'zh',
        'content-type': 'application/json',
        'accept-encoding': 'gzip'
    };
    const response = await axios.post(url, jsonData, {headers, params});
    const newCaptcha = response.data.captcha_token;
    console.log(`安全验证`);
    return {verificationToken}
}

async function signup(result) {
    const name = "U_" + mail.split('@')[0];
    const verificationToken = result.verificationToken;
    const url = 'https://user.mypikpak.com/v1/auth/signup';
    const params = {client_id: client};
    const jsonData = {
        captcha_token: '',
        client_id: client,
        client_secret: 'dbw2OtmVEeuUvIptb1Coyg',
        email: mail,
        name: name,
        password: pwd,
        verification_token: verificationToken
    };
    const headers = {'X-Device-Id': xid, 'User-Agent': ua};
    Object.assign(headers, basicRequestHeaders_1);
    const response = await axios.post(url, jsonData, {headers, params});
    const accessToken = response.data.access_token;
    const sub = response.data.sub;
    console.log(`注册账号\n用户ID:${sub}`);
    return {accessToken, sub};
}

async function init2(result) {
    const accessToken = result.accessToken;
    const sub = result.sub
    const url = 'https://user.mypikpak.com/v1/shield/captcha/init';
    const params = {client_id: client};
    const jsonData = {
        action: 'POST:/vip/v1/activity/invite',
        captcha_token: '',
        client_id: client,
        device_id: xid,
        meta: {
            captcha_sign: `1.${sign}`,
            user_id: sub,
            package_name: 'com.pikcloud.pikpak',
            client_version: '1.38.0',
            timestamp: t
        },
        redirect_uri: 'xlaccsdk01://xbase.cloud/callback?state=harbor'
    };
    const headers = {
        'X-Device-Id': xid,
        'User-Agent': ua,
    };
    Object.assign(headers, basicRequestHeaders_1);
    const response = await axios.post(url, jsonData, {headers, params});
    const newCaptcha = response.data.captcha_token;
    console.log(`二次安全验证`);
    return {newCaptcha, sub, accessToken};
}

async function invite(result) {
    const sub = result.sub;
    const captcha = result.newCaptcha;
    const accessToken = result.accessToken;
    const url = 'https://api-drive.mypikpak.com/vip/v1/activity/invite';
    const jsonData = {
        data: {
            sdk_int: '33',
            uuid: xid,
            userType: '1',
            userid: sub,
            userSub: '',
            product_flavor_name: 'cha',
            language_system: 'zh-CN',
            language_app: 'zh-CN',
            build_version_release: '13',
            phoneModel: deviceModel,
            build_manufacturer: deviceName,
            build_sdk_int: '33',
            channel: 'official',
            versionCode: '10150',
            versionName: '1.38.0',
            installFrom: 'other',
            country: 'PL'
        },
        apk_extra: {channel: 'official'}
    };
    const headers = {
        Host: 'api-drive.mypikpak.com',
        authorization: `Bearer ${accessToken}`,
        product_flavor_name: 'cha',
        'x-captcha-token': captcha,
        'x-client-version-code': '10150',
        'x-device-id': xid,
        'user-agent': ua,
        country: 'PL',
        'accept-language': 'zh-CN',
        'x-peer-id': xid,
        'x-user-region': '2',
        'x-system-language': 'zh-CN',
        'x-alt-capability': '3',
        'accept-encoding': 'gzip',
        'content-type': 'application/json'
    };
    await axios.post(url, jsonData, {headers});
    return {accessToken, captcha}
}

async function activationCode(result) {
    const captcha = result.newCaptcha;
    const accessToken = result.accessToken;
    const url = 'https://api-drive.mypikpak.com/vip/v1/order/activation-code';
    const data = {activation_code: invite_code};
    const lh = JSON.stringify(data).length.toString();
    const headers = {
        Host: 'api-drive.mypikpak.com',
        authorization: `Bearer ${accessToken}`,
        product_flavor_name: 'cha',
        'x-captcha-token': captcha,
        'x-client-version-code': '10150',
        'x-device-id': xid,
        'user-agent': ua,
        country: 'DK',
        'accept-language': 'zh-CN',
        'x-peer-id': xid,
        'x-user-region': '2',
        'x-system-language': 'zh-CN',
        'x-alt-capability': '3',
        'content-length': lh,
        'accept-encoding': 'gzip',
        'content-type': 'application/json'
    };
    const response = await axios.post(url, data, {headers});
    const results = response.data;
    if (response.data.add_days === 5) {
        console.log(`邀请码:${invite_code} => 邀请成功`)
    }
    else {
        console.log(`邀请码:${invite_code} => 邀请失败`)
    }
    return results;
}

const uaList = [{'model': 'MI-ONE PLUS', 'name': ' 小米 1 联通版'}, {'model': 'MI-ONE C1', 'name': ' 小米 1 电信版'},
    {'model': 'MI-ONE', 'name': ' 小米 1 青春版'}, {'model': '2012051', 'name': ' 小米 1S 联通版'},
    {'model': '2012053', 'name': ' 小米 1S 电信版'}, {'model': '2012052', 'name': ' 小米 1S 青春版'},
    {'model': '2012061', 'name': ' 小米 2 联通版'}, {'model': '2012062', 'name': ' 小米 2 电信版'},
    {'model': '2013012', 'name': ' 小米 2S 联通版'}, {'model': '2013021', 'name': ' 小米 2S 电信版'},
    {'model': '2012121', 'name': ' 小米 2A 联通版'}, {'model': '2013061', 'name': ' 小米 3 移动版'},
    {'model': '2013062', 'name': ' 小米 3 联通版'}, {'model': '2013063', 'name': ' 小米 3 电信版'},
    {'model': '2014215', 'name': ' 小米 4 联通 3G 版'}, {'model': '2014218', 'name': ' 小米 4 电信 3G 版'},
    {'model': '2014216', 'name': ' 小米 4 移动 4G 版'}, {'model': '2014719', 'name': ' 小米 4 联通 4G 版'},
    {'model': '2014716', 'name': ' 小米 4 电信 4G 版'},
    {'model': '2014726', 'name': ' 小米 4 电信 4G 合约版'},
    {'model': '2015015', 'name': ' 小米 4i 国际版'}, {'model': '2015561', 'name': ' 小米 4c 全网通版'},
    {'model': '2015562', 'name': ' 小米 4c 移动合约版'}, {'model': '2015911', 'name': ' 小米 4S 全网通版'},
    {'model': '2015201', 'name': ' 小米 5 标准版'}, {'model': '2015628', 'name': ' 小米 5 高配版 / 尊享版'},
    {'model': '2015105', 'name': ' 小米 5 国际版'}, {'model': '2015711', 'name': ' 小米 5s 全网通版'},
    {'model': '2016070', 'name': ' 小米 5s Plus 全网通版'}, {'model': '2016089', 'name': ' 小米 5c 移动版'},
    {'model': 'MDE2', 'name': ' 小米 5X 全网通版'}, {'model': 'MDT2', 'name': ' 小米 5X 移动 4G+ 版'},
    {'model': 'MCE16', 'name': ' 小米 6 全网通版'}, {'model': 'MCT1', 'name': ' 小米 6 移动 4G+ 版'},
    {'model': 'M1804D2SE', 'name': ' 小米 6X 全网通版'},
    {'model': 'M1804D2ST', 'name': ' 小米 6X 移动 4G+ 版'},
    {'model': 'M1804D2SC', 'name': ' 小米 6X 联通电信定制版'},
    {'model': 'M1803E1A', 'name': ' 小米 8 全网通版'},
    {'model': 'M1803E1T', 'name': ' 小米 8 移动 4G+ 版'},
    {'model': 'M1803E1C', 'name': ' 小米 8 联通电信定制版'},
    {'model': 'M1807E8S', 'name': ' 小米 8 透明探索版'}, {'model': 'M1807E8A', 'name': ' 小米 8 屏幕指纹版'},
    {'model': 'M1805E2A', 'name': ' 小米 8 SE 全网通版'},
    {'model': 'M1808D2TE', 'name': ' 小米 8 青春版 全网通版'},
    {'model': 'M1808D2TT', 'name': ' 小米 8 青春版 移动 4G+ 版'},
    {'model': 'M1808D2TC', 'name': ' 小米 8 青春版 联通电信定制版'},
    {'model': 'M1808D2TG', 'name': ' 小米 8 Lite 国际版'}, {'model': 'M1902F1A', 'name': ' 小米 9 全网通版'},
    {'model': 'M1902F1T', 'name': ' 小米 9 移动 4G+ 版'},
    {'model': 'M1902F1C', 'name': ' 小米 9 联通电信定制版'},
    {'model': 'M1902F1G', 'name': ' 小米 9 国际版'},
    {'model': 'M1908F1XE', 'name': ' 小米 9 Pro 5G 全网通版'},
    {'model': 'M1903F2A', 'name': ' 小米 9 SE 全网通版'}, {'model': 'M1903F2G', 'name': ' 小米 9 SE 国际版'},
    {'model': 'M1903F10G', 'name': ' 小米 9T 国际版'}, {'model': 'M1903F11G', 'name': ' 小米 9T Pro 国际版'},
    {'model': 'M1904F3BG', 'name': ' 小米 9 Lite 国际版'},
    {'model': 'M2001J2E M2001J2C', 'name': ' 小米 10 全网通版'},
    {'model': 'M2001J2G', 'name': ' 小米 10 国际版'},
    {'model': 'M2001J2I', 'name': ' 小米 10 印度版'},
    {'model': 'M2001J1E M2001J1C', 'name': ' 小米 10 Pro 全网通版'},
    {'model': 'M2001J1G', 'name': ' 小米 10 Pro 国际版'},
    {'model': 'M2002J9E', 'name': ' 小米 10 青春版 全网通版'},
    {'model': 'M2002J9G', 'name': ' 小米 10 Lite 国际版'},
    {'model': 'M2002J9S', 'name': ' 小米 10 Lite 韩国版'},
    {'model': 'M2002J9R XIG01', 'name': ' 小米 10 Lite 日本版 (KDDI)'},
    {'model': 'M2007J1SC', 'name': ' 小米 10 至尊纪念版 全网通版'},
    {'model': 'M2007J3SY', 'name': ' 小米 10T 国际版'}, {'model': 'M2007J3SP', 'name': ' 小米 10T 印度版'},
    {'model': 'M2007J3SG', 'name': ' 小米 10T Pro 国际版'},
    {'model': 'M2007J3SI', 'name': ' 小米 10T Pro 印度版'},
    {'model': 'M2007J17G', 'name': ' 小米 10T Lite 国际版'},
    {'model': 'M2007J17I', 'name': ' 小米 10i 印度版'},
    {'model': 'M2102J2SC', 'name': ' 小米 10S 全网通版'}, {'model': 'M2011K2C', 'name': ' 小米 11 全网通版'},
    {'model': 'M2011K2G', 'name': ' 小米 11 国际版'}, {'model': 'M2102K1AC', 'name': ' 小米 11 Pro 全网通版'},
    {'model': 'M2102K1C', 'name': ' 小米 11 Ultra 全网通版'},
    {'model': 'M2102K1G', 'name': ' 小米 11 Ultra 国际版'},
    {'model': 'M2101K9C', 'name': ' 小米 11 青春版 全网通版'},
    {'model': 'M2101K9G', 'name': ' 小米 11 Lite 5G 国际版'},
    {'model': 'M2101K9R', 'name': ' 小米 11 Lite 5G 日本版'},
    {'model': 'M2101K9AG', 'name': ' 小米 11 Lite 4G 国际版'},
    {'model': 'M2101K9AI', 'name': ' 小米 11 Lite 4G 印度版'},
    {'model': '2107119DC', 'name': ' Xiaomi 11 青春活力版 全网通版'},
    {'model': '2109119DG', 'name': ' Xiaomi 11 Lite 5G NE 国际版'},
    {'model': '2109119DI', 'name': ' Xiaomi 11 Lite NE 5G 印度版'},
    {'model': 'M2012K11G', 'name': ' 小米 11i 国际版'}, {'model': 'M2012K11AI', 'name': ' 小米 11X 印度版'},
    {'model': 'M2012K11I', 'name': ' 小米 11X Pro 印度版'},
    {'model': '21081111RG', 'name': ' Xiaomi 11T 国际版'},
    {'model': '2107113SG', 'name': ' Xiaomi 11T Pro 国际版'},
    {'model': '2107113SI', 'name': ' Xiaomi 11T Pro 印度版'},
    {'model': '2107113SR', 'name': ' Xiaomi 11T Pro 日本版'},
    {'model': '21091116I', 'name': ' Xiaomi 11i 印度版'},
    {'model': '21091116UI', 'name': ' Xiaomi 11i HyperCharge 印度版'},
    {'model': '2201123C', 'name': ' Xiaomi 12 全网通版'}, {'model': '2201123G', 'name': ' Xiaomi 12 国际版'},
    {'model': '2112123AC', 'name': ' Xiaomi 12X 全网通版'},
    {'model': '2112123AG', 'name': ' Xiaomi 12X 国际版'},
    {'model': '2201122C', 'name': ' Xiaomi 12 Pro 全网通版'},
    {'model': '2201122G', 'name': ' Xiaomi 12 Pro 国际版'},
    {'model': '2207122MC', 'name': ' Xiaomi 12 Pro 天玑版 全网通版'},
    {'model': '2203129G', 'name': ' Xiaomi 12 Lite 国际版'},
    {'model': '2203129I', 'name': ' Xiaomi 12 Lite 印度版'},
    {'model': '2206123SC', 'name': ' Xiaomi 12S 全网通版'},
    {'model': '2206122SC', 'name': ' Xiaomi 12S Pro 全网通版'},
    {'model': '2203121C', 'name': ' Xiaomi 12S Ultra 全网通版'},
    {'model': '22071212AG', 'name': ' Xiaomi 12T 国际版'},
    {'model': '22081212UG', 'name': ' Xiaomi 12T Pro 国际版'},
    {'model': '22081212R 22200414R', 'name': ' Xiaomi 12T Pro 日本版 (SIM Free)'},
    {'model': 'A201XM', 'name': ' Xiaomi 12T Pro 日本版 (SoftBank)'},
    {'model': '2211133C', 'name': ' Xiaomi 13 全网通版'}, {'model': '2211133G', 'name': ' Xiaomi 13 国际版'},
    {'model': '2210132C', 'name': ' Xiaomi 13 Pro 全网通版'},
    {'model': '2210132G', 'name': ' Xiaomi 13 Pro 国际版'},
    {'model': '2304FPN6DC', 'name': ' Xiaomi 13 Ultra 全网通版'},
    {'model': '2304FPN6DG', 'name': ' Xiaomi 13 Ultra 国际版'},
    {'model': '2210129SG', 'name': ' Xiaomi 13 Lite 国际版'},
    {'model': '2306EPN60G', 'name': ' Xiaomi 13T 国际版'},
    {'model': '2306EPN60R', 'name': ' Xiaomi 13T 日本版'},
    {'model': '23078PND5G', 'name': ' Xiaomi 13T Pro 国际版'},
    {'model': '2014616', 'name': ' 小米 Note 双网通版'}, {'model': '2014619', 'name': ' 小米 Note 全网通版'},
    {'model': '2014618', 'name': ' 小米 Note 移动合约版'},
    {'model': '2014617', 'name': ' 小米 Note 联通合约版'},
    {'model': '2015011', 'name': ' 小米 Note 国际版'},
    {'model': '2015021', 'name': ' 小米 Note 顶配版 双网通版'},
    {'model': '2015022', 'name': ' 小米 Note 顶配版 全网通版'},
    {'model': '2015501', 'name': ' 小米 Note 顶配版 移动合约版'},
    {'model': '2015211', 'name': ' 小米 Note 2 全网通版'},
    {'model': '2015212', 'name': ' 小米 Note 2 移动 4G+ 版'},
    {'model': '2015213', 'name': ' 小米 Note 2 全网通版 (全球频段)'},
    {'model': 'MCE8', 'name': ' 小米 Note 3 全网通版'}, {'model': 'MCT8', 'name': ' 小米 Note 3 移动 4G+ 版'},
    {'model': 'M1910F4G', 'name': ' 小米 Note 10 国际版'},
    {'model': 'M1910F4S', 'name': ' 小米 Note 10 Pro 国际版'},
    {'model': 'M2002F4LG', 'name': ' 小米 Note 10 Lite 国际版'},
    {'model': '2016080', 'name': ' 小米 MIX 全网通版'},
    {'model': 'MDE5', 'name': ' 小米 MIX 2 黑色陶瓷版 全网通版'},
    {'model': 'MDT5', 'name': ' 小米 MIX 2 黑色陶瓷版 移动 4G+ 版'},
    {'model': 'MDE5S', 'name': ' 小米 MIX 2 全陶瓷尊享版'},
    {'model': 'M1803D5XE', 'name': ' 小米 MIX 2S 全网通版'},
    {'model': 'M1803D5XA', 'name': ' 小米 MIX 2S 尊享版 (全球频段)'},
    {'model': 'M1803D5XT', 'name': ' 小米 MIX 2S 移动 4G+ 版'},
    {'model': 'M1803D5XC', 'name': ' 小米 MIX 2S 联通电信定制版'},
    {'model': 'M1810E5E', 'name': ' 小米 MIX 3 全网通版'},
    {'model': 'M1810E5A', 'name': ' 小米 MIX 3 全网通版 (全球频段)'},
    {'model': 'M1810E5GG', 'name': ' 小米 MIX 3 5G'},
    {'model': 'M2011J18C', 'name': ' MIX FOLD 小米折叠屏手机'},
    {'model': '2106118C', 'name': ' Xiaomi MIX 4'}, {'model': '22061218C', 'name': ' Xiaomi MIX Fold 2'},
    {'model': '2308CPXD0C', 'name': ' Xiaomi MIX Fold 3'},
    {'model': '2016001', 'name': ' 小米 Max 标准版 全网通版'},
    {'model': '2016002', 'name': ' 小米 Max 标准版 国际版'}, {'model': '2016007', 'name': ' 小米 Max 高配版'},
    {'model': 'MDE40', 'name': ' 小米 Max 2 全网通版'}, {'model': 'MDT4', 'name': ' 小米 Max 2 移动 4G+ 版'},
    {'model': 'MDI40', 'name': ' 小米 Max 2 印度版'}, {'model': 'M1804E4A', 'name': ' 小米 Max 3 全网通版'},
    {'model': 'M1804E4T', 'name': ' 小米 Max 3 移动 4G+ 版'},
    {'model': 'M1804E4C', 'name': ' 小米 Max 3 联通电信定制版'},
    {'model': 'M1904F3BC', 'name': ' 小米 CC9 全网通版'},
    {'model': 'M1904F3BT', 'name': ' 小米 CC9 美图定制版'},
    {'model': 'M1906F9SC', 'name': ' 小米 CC9e 全网通版'},
    {'model': 'M1910F4E', 'name': ' 小米 CC9 Pro 全网通版'},
    {'model': '2109119BC', 'name': ' Xiaomi Civi 全网通版'},
    {'model': '2109119BC', 'name': ' Xiaomi Civi 1S 全网通版'},
    {'model': '2209129SC', 'name': ' Xiaomi Civi 2 全网通版'},
    {'model': '23046PNC9C', 'name': ' Xiaomi Civi 3 全网通版'},
    {'model': 'M1901F9E', 'name': ' 小米 Play 全网通版'},
    {'model': 'M1901F9T', 'name': ' 小米 Play 移动 4G+ 版'},
    {'model': 'MDG2', 'name': ' 小米 A1 国际版'}, {'model': 'MDI2', 'name': ' 小米 A1 印度版'},
    {'model': 'M1804D2SG', 'name': ' 小米 A2 国际版'}, {'model': 'M1804D2SI', 'name': ' 小米 A2 印度版'},
    {'model': 'M1805D1SG', 'name': ' 小米 A2 Lite 国际版'}, {'model': 'M1906F9SH', 'name': ' 小米 A3 国际版'},
    {'model': 'M1906F9SI', 'name': ' 小米 A3 印度版'}, {'model': 'A0101', 'name': ' 小米平板'},
    {'model': '2015716', 'name': ' 小米平板 2'}, {'model': 'MCE91', 'name': ' 小米平板 3'},
    {'model': 'M1806D9W', 'name': ' 小米平板 4 Wi-Fi 版'},
    {'model': 'M1806D9E', 'name': ' 小米平板 4 LTE 版'},
    {'model': 'M1806D9PE', 'name': ' 小米平板 4 Plus LTE 版'},
    {'model': '21051182C', 'name': ' 小米平板 5 国行版'},
    {'model': '21051182G', 'name': ' 小米平板 5 国际版'},
    {'model': 'M2105K81AC', 'name': ' 小米平板 5 Pro Wi-Fi 版'},
    {'model': 'M2105K81C', 'name': ' 小米平板 5 Pro 5G'},
    {'model': '22081281AC', 'name': ' 小米平板 5 Pro 12.4 英寸'},
    {'model': '23043RP34C', 'name': ' Xiaomi Pad 6 国行版'},
    {'model': '23043RP34G', 'name': ' Xiaomi Pad 6 国际版'},
    {'model': '23043RP34I', 'name': ' Xiaomi Pad 6 印度版'},
    {'model': '23046RP50C', 'name': ' Xiaomi Pad 6 Pro'},
    {'model': '2307BRPDCC', 'name': ' Xiaomi Pad 6 Max 14'}, {'model': '2013022', 'name': ' 红米手机 移动版'},
    {'model': '2013023', 'name': ' 红米手机 联通版'}, {'model': '2013029', 'name': ' 红米 1S 联通版'},
    {'model': '2013028', 'name': ' 红米 1S 电信版'}, {'model': '2014011', 'name': ' 红米 1S 移动 3G 版'},
    {'model': '2014501', 'name': ' 红米 1S 移动 4G 版'}, {'model': '2014813', 'name': ' 红米 2 移动版'},
    {'model': '2014112', 'name': ' 红米 2 移动合约版'}, {'model': '2014811', 'name': ' 红米 2 联通版'},
    {'model': '2014812', 'name': ' 红米 2 电信版'}, {'model': '2014821', 'name': ' 红米 2 电信合约版'},
    {'model': '2014817', 'name': ' 红米 2 国际版'}, {'model': '2014818', 'name': ' 红米 2 印度版'},
    {'model': '2014819', 'name': ' 红米 2 巴西版'}, {'model': '2014502', 'name': ' 红米 2A 标准版'},
    {'model': '2014512 2014055', 'name': ' 红米 2A 增强版'}, {'model': '2014816', 'name': ' 红米 2A 高配版'},
    {'model': '2015811 2015815', 'name': ' 红米 3 全网通 标准版'},
    {'model': '2015812', 'name': ' 红米 3 移动合约 标准版'},
    {'model': '2015810', 'name': ' 红米 3 联通合约 标准版'},
    {'model': '2015817 2015819', 'name': ' 红米 3 全网通 高配版'},
    {'model': '2015818', 'name': ' 红米 3 联通合约 高配版'}, {'model': '2015816', 'name': ' 红米 3 国际版'},
    {'model': '2016030', 'name': ' 红米 3S 全网通版'}, {'model': '2016031', 'name': ' 红米 3S 国际版'},
    {'model': '2016032', 'name': ' 红米 3S Prime 印度版'}, {'model': '2016037', 'name': ' 红米 3S 印度版'},
    {'model': '2016036', 'name': ' 红米 3X 全网通版'}, {'model': '2016035', 'name': ' 红米 3X 移动合约版'},
    {'model': '2016033', 'name': ' 红米 3X 全网通版 (联通定制)'},
    {'model': '2016090', 'name': ' 红米 4 标准版'},
    {'model': '2016060', 'name': ' 红米 4 高配版'}, {'model': '2016111', 'name': ' 红米 4A 全网通版'},
    {'model': '2016112', 'name': ' 红米 4A 移动 4G+ 版'}, {'model': '2016117', 'name': ' 红米 4A 国际版'},
    {'model': '2016116', 'name': ' 红米 4A 印度版'}, {'model': 'MAE136', 'name': ' 红米 4X 全网通版'},
    {'model': 'MAT136', 'name': ' 红米 4X 移动 4G+ 版'}, {'model': 'MAG138', 'name': ' 红米 4X 国际版'},
    {'model': 'MAI132', 'name': ' 红米 4 印度版'}, {'model': 'MDE1', 'name': ' 红米 5 全网通版'},
    {'model': 'MDT1', 'name': ' 红米 5 移动 4G+ 版'}, {'model': 'MDG1', 'name': ' 红米 5 国际版'},
    {'model': 'MDI1', 'name': ' 红米 5 印度版'}, {'model': 'MEE7', 'name': ' 红米 5 Plus 全网通版'},
    {'model': 'MET7', 'name': ' 红米 5 Plus 移动 4G+ 版'}, {'model': 'MEG7', 'name': ' 红米 5 Plus 国际版'},
    {'model': 'MCE3B', 'name': ' 红米 5A 全网通版'}, {'model': 'MCT3B', 'name': ' 红米 5A 移动 4G+ 版'},
    {'model': 'MCG3B', 'name': ' 红米 5A 国际版'}, {'model': 'MCI3B', 'name': ' 红米 5A 印度版'},
    {'model': 'M1804C3DE', 'name': ' 红米 6 全网通版'}, {'model': 'M1804C3DT', 'name': ' 红米 6 移动 4G+ 版'},
    {'model': 'M1804C3DC', 'name': ' 红米 6 联通电信定制版'},
    {'model': 'M1804C3DG M1804C3DH', 'name': ' 红米 6 国际版'},
    {'model': 'M1804C3DI', 'name': ' 红米 6 印度版'},
    {'model': 'M1805D1SE', 'name': ' 红米 6 Pro 全网通版'},
    {'model': 'M1805D1ST', 'name': ' 红米 6 Pro 移动 4G+ 版'},
    {'model': 'M1805D1SC', 'name': ' 红米 6 Pro 联通电信定制版'},
    {'model': 'M1805D1SI', 'name': ' 红米 6 Pro 印度版'}, {'model': 'M1804C3CE', 'name': ' 红米 6A 全网通版'},
    {'model': 'M1804C3CT', 'name': ' 红米 6A 移动 4G+ 版'},
    {'model': 'M1804C3CC', 'name': ' 红米 6A 联通电信定制版'},
    {'model': 'M1804C3CG M1804C3CH', 'name': ' 红米 6A 国际版'},
    {'model': 'M1804C3CI', 'name': ' 红米 6A 印度版'}, {'model': 'M1810F6LE', 'name': ' Redmi 7 全网通版'},
    {'model': 'M1810F6LT', 'name': ' Redmi 7 运营商全网通版'},
    {'model': 'M1810F6LG M1810F6LH', 'name': ' Redmi 7 国际版'},
    {'model': 'M1810F6LI', 'name': ' Redmi 7 印度版'}, {'model': 'M1903C3EE', 'name': ' Redmi 7A 全网通版'},
    {'model': 'M1903C3ET', 'name': ' Redmi 7A 移动 4G+ 版'},
    {'model': 'M1903C3EC', 'name': ' Redmi 7A 联通电信定制版'},
    {'model': 'M1903C3EG M1903C3EH', 'name': ' Redmi 7A 国际版'},
    {'model': 'M1903C3EI', 'name': ' Redmi 7A 印度版'}, {'model': 'M1908C3IE', 'name': ' Redmi 8 全网通版'},
    {'model': 'M1908C3IC', 'name': ' Redmi 8 运营商全网通版'},
    {'model': 'M1908C3IG M1908C3IH', 'name': ' Redmi 8 国际版'},
    {'model': 'M1908C3II', 'name': ' Redmi 8 印度版'}, {'model': 'M1908C3KE', 'name': ' Redmi 8A 全网通版'},
    {'model': 'M1908C3KG M1908C3KH', 'name': ' Redmi 8A 国际版'},
    {'model': 'M1908C3KI', 'name': ' Redmi 8A 印度版'},
    {'model': 'M2001C3K3I', 'name': ' Redmi 8A Dual 印度版 / Redmi 8A Pro 国际版'},
    {'model': 'M2004J19C', 'name': ' Redmi 9 全网通版'}, {'model': 'M2004J19G', 'name': ' Redmi 9 国际版'},
    {'model': 'M2004J19I', 'name': ' Redmi 9 Prime 印度版'},
    {'model': 'M2004J19AG', 'name': ' Redmi 9 国际版 (NFC)'},
    {'model': 'M2006C3LC', 'name': ' Redmi 9A 全网通版'}, {'model': 'M2006C3LG', 'name': ' Redmi 9A 国际版'},
    {'model': 'M2006C3LVG', 'name': ' Redmi 9AT 国际版'},
    {'model': 'M2006C3LI', 'name': ' Redmi 9A 印度版 / Redmi 9A Sport 印度版'},
    {'model': 'M2006C3LII', 'name': ' Redmi 9i 印度版 / Redmi 9i Sport 印度版'},
    {'model': 'M2006C3MG', 'name': ' Redmi 9C 国际版'}, {'model': 'M2006C3MT', 'name': ' Redmi 9C 泰国版'},
    {'model': 'M2006C3MNG', 'name': ' Redmi 9C NFC 国际版'},
    {'model': 'M2006C3MII', 'name': ' Redmi 9 印度版 / Redmi 9 Activ 印度版'},
    {'model': 'M2010J19SG', 'name': ' Redmi 9T 国际版'},
    {'model': 'M2010J19SI', 'name': ' Redmi 9 Power 印度版'},
    {'model': 'M2010J19SR', 'name': ' Redmi 9T 日本版'}, {'model': 'M2010J19ST', 'name': ' Redmi 9T 泰国版'},
    {'model': 'M2010J19SY', 'name': ' Redmi 9T 国际版 (NFC)'},
    {'model': 'M2010J19SL', 'name': ' Redmi 9T 拉美版'}, {'model': '21061119AG', 'name': ' Redmi 10 国际版'},
    {'model': '21061119AL', 'name': ' Redmi 10 拉美版'},
    {'model': '21061119BI', 'name': ' Redmi 10 Prime 印度版'},
    {'model': '21061119DG', 'name': ' Redmi 10 国际版 (NFC)'},
    {'model': '21121119SG', 'name': ' Redmi 10 2022 国际版'},
    {'model': '21121119VL', 'name': ' Redmi 10 2022 拉美版'},
    {'model': '22011119TI', 'name': ' Redmi 10 Prime 2022 印度版'},
    {'model': '22011119UY', 'name': ' Redmi 10 2022 国际版 (NFC)'},
    {'model': '22041219G', 'name': ' Redmi 10 5G 国际版'},
    {'model': '22041219I', 'name': ' Redmi 11 Prime 5G 印度版'},
    {'model': '22041219NY', 'name': ' Redmi 10 5G 国际版 (NFC)'},
    {'model': '220333QAG', 'name': ' Redmi 10C 国际版'},
    {'model': '220333QBI', 'name': ' Redmi 10 印度版 / Redmi 10 Power 印度版'},
    {'model': '220333QNY', 'name': ' Redmi 10C 国际版 (NFC)'},
    {'model': '220333QL', 'name': ' Redmi 10C 拉美版'},
    {'model': '220233L2C', 'name': ' Redmi 10A 全网通版'},
    {'model': '220233L2G', 'name': ' Redmi 10A 国际版'},
    {'model': '220233L2I', 'name': ' Redmi 10A 印度版 / Redmi 10A Sport 印度版'},
    {'model': '22071219AI', 'name': ' Redmi 11 Prime 印度版'},
    {'model': '23053RN02A', 'name': ' Redmi 12 国际版'}, {'model': '23053RN02I', 'name': ' Redmi 12 印度版'},
    {'model': '23053RN02L', 'name': ' Redmi 12 拉美版'},
    {'model': '23053RN02Y', 'name': ' Redmi 12 国际版 (NFC)'},
    {'model': '23077RABDC', 'name': ' Redmi 12 5G 全网通版'},
    {'model': '23076RN8DY', 'name': ' Redmi 12 5G 国际版 (NFC)'},
    {'model': '23076RN4BI', 'name': ' Redmi 12 5G 印度版'},
    {'model': '22120RN86C', 'name': ' Redmi 12C 全网通版'},
    {'model': '22120RN86G', 'name': ' Redmi 12C 国际版'},
    {'model': '2212ARNC4L', 'name': ' Redmi 12C 拉美版'},
    {'model': '22126RN91Y', 'name': ' Redmi 12C 国际版 (NFC)'},
    {'model': '2014018', 'name': ' 红米 Note 联通 3G 标准版'},
    {'model': '2013121', 'name': ' 红米 Note 联通 3G 增强版'},
    {'model': '2014017', 'name': ' 红米 Note 移动 3G 标准版'},
    {'model': '2013122', 'name': ' 红米 Note 移动 3G 增强版'},
    {'model': '2014022', 'name': ' 红米 Note 移动 4G 增强版'},
    {'model': '2014021', 'name': ' 红米 Note 联通 4G 增强版'},
    {'model': '2014715', 'name': ' 红米 Note 4G 国际版'},
    {'model': '2014712', 'name': ' 红米 Note 4G 印度版'},
    {'model': '2014915', 'name': ' 红米 Note 移动 4G 双卡版'},
    {'model': '2014912', 'name': ' 红米 Note 联通 4G 双卡版'},
    {'model': '2014916', 'name': ' 红米 Note 电信 4G 双卡版'},
    {'model': '2014911', 'name': ' 红米 Note 移动 4G 双卡合约版'},
    {'model': '2014910', 'name': ' 红米 Note 电信 4G 双卡合约版'},
    {'model': '2015052', 'name': ' 红米 Note 2 移动版'},
    {'model': '2015051', 'name': ' 红米 Note 2 双网通版'},
    {'model': '2015712', 'name': ' 红米 Note 2 双网通高配版'},
    {'model': '2015055', 'name': ' 红米 Note 2 移动合约版'},
    {'model': '2015056', 'name': ' 红米 Note 2 移动合约高配版'},
    {'model': '2015617', 'name': ' 红米 Note 3 双网通版'},
    {'model': '2015611', 'name': ' 红米 Note 3 移动合约版'},
    {'model': '2015112 2015115', 'name': ' 红米 Note 3 全网通版'},
    {'model': '2015116', 'name': ' 红米 Note 3 国际版'},
    {'model': '2015161', 'name': ' 红米 Note 3 台湾特制版'},
    {'model': '2016050', 'name': ' 红米 Note 4 全网通版'},
    {'model': '2016051', 'name': ' 红米 Note 4 移动版'},
    {'model': '2016101', 'name': ' 红米 Note 4X 高通 全网通版'},
    {'model': '2016130', 'name': ' 红米 Note 4X 高通 移动 4G+ 版'},
    {'model': '2016100 2016102', 'name': ' 红米 Note 4 国际版 / 红米 Note 4X 高通 国际版'},
    {'model': 'MBE6A5', 'name': ' 红米 Note 4X MTK 全网通版'},
    {'model': 'MBT6A5', 'name': ' 红米 Note 4X MTK 移动 4G+ 版'},
    {'model': 'MEI7', 'name': ' 红米 Note 5 印度版'}, {'model': 'MEE7S', 'name': ' 红米 Note 5 全网通版'},
    {'model': 'MET7S', 'name': ' 红米 Note 5 移动 4G+ 版'},
    {'model': 'MEC7S', 'name': ' 红米 Note 5 联通电信定制版'},
    {'model': 'M1803E7SG M1803E7SH', 'name': ' 红米 Note 5 国际版'},
    {'model': 'MEI7S', 'name': ' 红米 Note 5 Pro 印度版'},
    {'model': 'MDE6', 'name': ' 红米 Note 5A 全网通 标准版'},
    {'model': 'MDT6', 'name': ' 红米 Note 5A 移动 4G+ 标准版'},
    {'model': 'MDG6', 'name': ' 红米 Note 5A 国际版 标准版'},
    {'model': 'MDI6', 'name': ' 红米 Y1 Lite 印度版'},
    {'model': 'MDE6S', 'name': ' 红米 Note 5A 全网通 高配版'},
    {'model': 'MDT6S', 'name': ' 红米 Note 5A 移动 4G+ 高配版'},
    {'model': 'MDG6S', 'name': ' 红米 Note 5A 国际版 高配版'}, {'model': 'MDI6S', 'name': ' 红米 Y1 印度版'},
    {'model': 'M1806E7TG M1806E7TH', 'name': ' 红米 Note 6 Pro 国际版'},
    {'model': 'M1806E7TI', 'name': ' 红米 Note 6 Pro 印度版'},
    {'model': 'M1901F7E', 'name': ' Redmi Note 7 全网通版'},
    {'model': 'M1901F7T', 'name': ' Redmi Note 7 移动 4G+ 版'},
    {'model': 'M1901F7C', 'name': ' Redmi Note 7 联通电信定制版'},
    {'model': 'M1901F7G M1901F7H', 'name': ' Redmi Note 7 国际版'},
    {'model': 'M1901F7I', 'name': ' Redmi Note 7 印度版 / Redmi Note 7S 印度版'},
    {'model': 'M1901F7BE', 'name': ' Redmi Note 7 Pro 全网通版'},
    {'model': 'M1901F7S', 'name': ' Redmi Note 7 Pro 印度版'},
    {'model': 'M1908C3JE', 'name': ' Redmi Note 8 全网通版'},
    {'model': 'M1908C3JC', 'name': ' Redmi Note 8 运营商全网通版'},
    {'model': 'M1908C3JG M1908C3JH', 'name': ' Redmi Note 8 国际版'},
    {'model': 'M1908C3JI', 'name': ' Redmi Note 8 印度版'},
    {'model': 'M1908C3XG', 'name': ' Redmi Note 8T 国际版'},
    {'model': 'M1908C3JGG', 'name': ' Redmi Note 8 (2021) 国际版'},
    {'model': 'M1906G7E', 'name': ' Redmi Note 8 Pro 全网通版'},
    {'model': 'M1906G7T', 'name': ' Redmi Note 8 Pro 运营商全网通版'},
    {'model': 'M1906G7G', 'name': ' Redmi Note 8 Pro 国际版'},
    {'model': 'M1906G7I', 'name': ' Redmi Note 8 Pro 印度版'},
    {'model': 'M2010J19SC', 'name': ' Redmi Note 9 4G 全网通版'},
    {'model': 'M2007J22C', 'name': ' Redmi Note 9 5G 全网通版'},
    {'model': 'M2003J15SS', 'name': ' Redmi Note 9 国际版'},
    {'model': 'M2003J15SI', 'name': ' Redmi Note 9 印度版'},
    {'model': 'M2003J15SG', 'name': ' Redmi Note 9 国际版 (NFC)'},
    {'model': 'M2007J22G', 'name': ' Redmi Note 9T 5G 国际版'},
    {'model': 'M2007J22R A001XM', 'name': ' Redmi Note 9T 5G 日本版 (SoftBank)'},
    {'model': 'M2007J17C', 'name': ' Redmi Note 9 Pro 5G 全网通版'},
    {'model': 'M2003J6A1G', 'name': ' Redmi Note 9S 国际版'},
    {'model': 'M2003J6A1R', 'name': ' Redmi Note 9S 日本版 / Redmi Note 9S 韩国版'},
    {'model': 'M2003J6A1I', 'name': ' Redmi Note 9 Pro 印度版'},
    {'model': 'M2003J6B1I', 'name': ' Redmi Note 9 Pro Max 印度版'},
    {'model': 'M2003J6B2G', 'name': ' Redmi Note 9 Pro 国际版'},
    {'model': 'M2101K7AG', 'name': ' Redmi Note 10 国际版'},
    {'model': 'M2101K7AI', 'name': ' Redmi Note 10 印度版'},
    {'model': 'M2101K7BG', 'name': ' Redmi Note 10S 国际版'},
    {'model': 'M2101K7BI', 'name': ' Redmi Note 10S 印度版'},
    {'model': 'M2101K7BNY', 'name': ' Redmi Note 10S 国际版 (NFC)'},
    {'model': 'M2101K7BL', 'name': ' Redmi Note 10S 拉美版'},
    {'model': 'M2103K19C', 'name': ' Redmi Note 10 5G 全网通版 / Redmi Note 11SE 全网通版'},
    {'model': 'M2103K19I', 'name': ' Redmi Note 10T 5G 印度版'},
    {'model': 'M2103K19G', 'name': ' Redmi Note 10 5G 国际版'},
    {'model': 'M2103K19Y', 'name': ' Redmi Note 10T 国际版'},
    {'model': 'M2104K19J XIG02', 'name': ' Redmi Note 10 JE 日本版 (KDDI)'},
    {'model': '22021119KR', 'name': ' Redmi Note 10T 日本版 (SIM Free)'},
    {'model': 'A101XM', 'name': ' Redmi Note 10T 日本版 (SoftBank)'},
    {'model': 'M2101K6G', 'name': ' Redmi Note 10 Pro 国际版'},
    {'model': 'M2101K6T', 'name': ' Redmi Note 10 Pro 泰国版'},
    {'model': 'M2101K6R', 'name': ' Redmi Note 10 Pro 日本版'},
    {'model': 'M2101K6P', 'name': ' Redmi Note 10 Pro 印度版'},
    {'model': 'M2101K6I', 'name': ' Redmi Note 10 Pro Max 印度版'},
    {'model': 'M2104K10AC', 'name': ' Redmi Note 10 Pro 5G 全网通版'},
    {'model': '2109106A1I', 'name': ' Redmi Note 10 Lite 印度版'},
    {'model': '21121119SC', 'name': ' Redmi Note 11 4G 全网通版'},
    {'model': '2201117TG', 'name': ' Redmi Note 11 国际版'},
    {'model': '2201117TI', 'name': ' Redmi Note 11 印度版'},
    {'model': '2201117TL', 'name': ' Redmi Note 11 拉美版'},
    {'model': '2201117TY', 'name': ' Redmi Note 11 国际版 (NFC)'},
    {'model': '21091116AC', 'name': ' Redmi Note 11 5G 全网通版'},
    {'model': '21091116AI', 'name': ' Redmi Note 11T 5G 印度版'},
    {'model': '22041219C', 'name': ' Redmi Note 11E 5G 全网通版'},
    {'model': '2201117SG', 'name': ' Redmi Note 11S 国际版'},
    {'model': '2201117SI', 'name': ' Redmi Note 11S 印度版'},
    {'model': '2201117SL', 'name': ' Redmi Note 11S 拉美版'},
    {'model': '2201117SY', 'name': ' Redmi Note 11S 国际版 (NFC)'},
    {'model': '22087RA4DI', 'name': ' Redmi Note 11 SE 印度版'},
    {'model': '22031116BG', 'name': ' Redmi Note 11S 5G 国际版'},
    {'model': '21091116C', 'name': ' Redmi Note 11 Pro 全网通版'},
    {'model': '2201116TG', 'name': ' Redmi Note 11 Pro 国际版'},
    {'model': '2201116TI', 'name': ' Redmi Note 11 Pro 印度版'},
    {'model': '2201116SC', 'name': ' Redmi Note 11E Pro 全网通版'},
    {'model': '2201116SG', 'name': ' Redmi Note 11 Pro 5G 国际版'},
    {'model': '2201116SR', 'name': ' Redmi Note 11 Pro 5G 日本版'},
    {'model': '2201116SI', 'name': ' Redmi Note 11 Pro+ 5G 印度版'},
    {'model': '21091116UC', 'name': ' Redmi Note 11 Pro+ 全网通版'},
    {'model': '21091116UG', 'name': ' Redmi Note 11 Pro+ 5G 国际版'},
    {'model': '22041216C', 'name': ' Redmi Note 11T Pro 全网通版'},
    {'model': '22041216UC', 'name': ' Redmi Note 11T Pro+ 全网通版'},
    {'model': '22095RA98C', 'name': ' Redmi Note 11R 5G 全网通版'},
    {'model': '23021RAAEG', 'name': ' Redmi Note 12 国际版'},
    {'model': '23027RAD4I', 'name': ' Redmi Note 12 印度版'},
    {'model': '23028RA60L', 'name': ' Redmi Note 12 拉美版'},
    {'model': '23021RAA2Y', 'name': ' Redmi Note 12 国际版 (NFC)'},
    {'model': '22101317C', 'name': ' Redmi Note 12 5G 全网通版 / Redmi Note 12R Pro 全网通版'},
    {'model': '22111317G', 'name': ' Redmi Note 12 5G 国际版'},
    {'model': '22111317I', 'name': ' Redmi Note 12 5G 印度版'},
    {'model': '23076RA4BC', 'name': ' Redmi Note 12R 全网通版'},
    {'model': '2303CRA44A', 'name': ' Redmi Note 12S 国际版'},
    {'model': '2303ERA42L', 'name': ' Redmi Note 12S 拉美版'},
    {'model': '23030RAC7Y', 'name': ' Redmi Note 12S 国际版 (NFC)'},
    {'model': '2209116AG', 'name': ' Redmi Note 12 Pro 国际版'},
    {'model': '22101316C', 'name': ' Redmi Note 12 Pro 全网通版'},
    {'model': '22101316G', 'name': ' Redmi Note 12 Pro 5G 国际版'},
    {'model': '22101316I', 'name': ' Redmi Note 12 Pro 5G 印度版'},
    {'model': '22101316UCP', 'name': ' Redmi Note 12 Pro+ 全网通版'},
    {'model': '22101316UG', 'name': ' Redmi Note 12 Pro+ 5G 国际版'},
    {'model': '22101316UP', 'name': ' Redmi Note 12 Pro+ 5G 印度版'},
    {'model': '22101316UC', 'name': ' Redmi Note 12 探索版 全网通版'},
    {'model': '22101320C', 'name': ' Redmi Note 12 Pro 极速版 全网通版'},
    {'model': '23054RA19C', 'name': ' Redmi Note 12T Pro 全网通版'},
    {'model': '23049RAD8C', 'name': ' Redmi Note 12 Turbo 全网通版'},
    {'model': 'M2004J7AC', 'name': ' Redmi 10X 5G 全网通版'},
    {'model': 'M2004J7BC', 'name': ' Redmi 10X Pro 5G 全网通版'},
    {'model': 'M2003J15SC', 'name': ' Redmi 10X 4G 全网通版'},
    {'model': 'M1903F10A', 'name': ' Redmi K20 全网通版'},
    {'model': 'M1903F10C', 'name': ' Redmi K20 运营商全网通版'},
    {'model': 'M1903F10I', 'name': ' Redmi K20 印度版'},
    {'model': 'M1903F11A', 'name': ' Redmi K20 Pro 全网通版'},
    {'model': 'M1903F11C', 'name': ' Redmi K20 Pro 运营商全网通版'},
    {'model': 'M1903F11I', 'name': ' Redmi K20 Pro 印度版'},
    {'model': 'M1903F11A', 'name': ' Redmi K20 Pro 尊享版 全网通版'},
    {'model': 'M2001G7AE', 'name': ' Redmi K30 5G 全网通版 / Redmi K30 5G 极速版'},
    {'model': 'M2001G7AC', 'name': ' Redmi K30 5G 全网通版'},
    {'model': 'M2001G7AC', 'name': ' Redmi K30i 5G 全网通版'},
    {'model': 'M1912G7BE', 'name': ' Redmi K30 4G 全网通版'},
    {'model': 'M1912G7BC', 'name': ' Redmi K30 4G 运营商全网通版'},
    {'model': 'M2001J11C', 'name': ' Redmi K30 Pro 全网通版'},
    {'model': 'M2001J11C M2001J11E', 'name': ' Redmi K30 Pro 变焦版 全网通版'},
    {'model': 'M2006J10C', 'name': ' Redmi K30 至尊纪念版 全网通版'},
    {'model': 'M2007J3SC', 'name': ' Redmi K30S 至尊纪念版 全网通版'},
    {'model': 'M2012K11AC', 'name': ' Redmi K40 全网通版'},
    {'model': 'M2012K11C', 'name': ' Redmi K40 Pro 全网通版 / Redmi K40 Pro+ 全网通版'},
    {'model': 'M2012K10C', 'name': ' Redmi K40 游戏增强版 全网通版'},
    {'model': '22021211RC', 'name': ' Redmi K40S 全网通版'},
    {'model': '22041211AC', 'name': ' Redmi K50 全网通版'},
    {'model': '22011211C', 'name': ' Redmi K50 Pro 全网通版'},
    {'model': '21121210C', 'name': ' Redmi K50 电竞版 全网通版'},
    {'model': '22081212C', 'name': ' Redmi K50 至尊版 全网通版'},
    {'model': '22041216I', 'name': ' Redmi K50i 印度版'},
    {'model': '23013RK75C', 'name': ' Redmi K60 全网通版'},
    {'model': '22127RK46C', 'name': ' Redmi K60 Pro 全网通版'},
    {'model': '22122RK93C', 'name': ' Redmi K60E 全网通版'},
    {'model': '23078RKD5C', 'name': ' Redmi K60 至尊版 全网通版'},
    {'model': '2016020', 'name': ' 红米 Pro 标准版'},
    {'model': '2016021', 'name': ' 红米 Pro 高配版 / 尊享版'},
    {'model': 'M1803E6E', 'name': ' 红米 S2 全网通版'}, {'model': 'M1803E6T', 'name': ' 红米 S2 移动 4G+ 版'},
    {'model': 'M1803E6C', 'name': ' 红米 S2 联通电信定制版'},
    {'model': 'M1803E6G M1803E6H', 'name': ' 红米 S2 国际版'},
    {'model': 'M1803E6I', 'name': ' 红米 Y2 印度版'},
    {'model': 'M1810F6G', 'name': ' Redmi Y3 国际版'}, {'model': 'M1810F6I', 'name': ' Redmi Y3 印度版'},
    {'model': 'M1903C3GG M1903C3GH', 'name': ' Redmi Go 国际版'},
    {'model': 'M1903C3GI', 'name': ' Redmi Go 印度版'}, {'model': '220733SG', 'name': ' Redmi A1 国际版'},
    {'model': '220733SH 220733SI', 'name': ' Redmi A1 印度版'},
    {'model': '220733SL', 'name': ' Redmi A1 拉美版'},
    {'model': '220733SFG', 'name': ' Redmi A1+ 国际版'},
    {'model': '220733SFH 220743FI', 'name': ' Redmi A1+ 印度版'},
    {'model': '23028RNCAG', 'name': ' Redmi A2+ 国际版'}, {'model': '22081283C', 'name': ' Redmi Pad 国行版'},
    {'model': '22081283G', 'name': ' Redmi Pad 国际版'},
    {'model': '23073RPBFC', 'name': ' Redmi Pad SE 国行版'},
    {'model': '23073RPBFG', 'name': ' Redmi Pad SE 国际版'},
    {'model': '23073RPBFL', 'name': ' Redmi Pad SE 拉美版'}, {'model': 'M1805E10A', 'name': ' POCO F1'},
    {'model': 'M2004J11G', 'name': ' POCO F2 Pro 国际版'}, {'model': 'M2012K11AG', 'name': ' POCO F3 国际版'},
    {'model': 'M2104K10I', 'name': ' POCO F3 GT 印度版'}, {'model': '22021211RG', 'name': ' POCO F4 国际版'},
    {'model': '22021211RI', 'name': ' POCO F4 印度版'}, {'model': '21121210G', 'name': ' POCO F4 GT 国际版'},
    {'model': '21121210I', 'name': ' POCO F4 GT 印度版'}, {'model': '23049PCD8G', 'name': ' POCO F5 国际版'},
    {'model': '23049PCD8I', 'name': ' POCO F5 印度版'},
    {'model': '23013PC75G', 'name': ' POCO F5 Pro 国际版'},
    {'model': 'M1912G7BI', 'name': ' POCO X2 印度版'}, {'model': 'M2007J20CI', 'name': ' POCO X3 印度版'},
    {'model': 'M2007J20CG', 'name': ' POCO X3 NFC 国际版'},
    {'model': 'M2007J20CT', 'name': ' POCO X3 NFC 泰国版'},
    {'model': 'M2102J20SG', 'name': ' POCO X3 Pro 国际版'},
    {'model': 'M2102J20SI', 'name': ' POCO X3 Pro 印度版'},
    {'model': '21061110AG', 'name': ' POCO X3 GT 国际版'},
    {'model': '2201116PG', 'name': ' POCO X4 Pro 5G 国际版'},
    {'model': '2201116PI', 'name': ' POCO X4 Pro 5G 印度版'},
    {'model': '22041216G', 'name': ' POCO X4 GT 国际版'},
    {'model': '22041216UG', 'name': ' POCO X4 GT Pro 国际版'},
    {'model': '22111317PG', 'name': ' POCO X5 5G 国际版'},
    {'model': '22111317PI', 'name': ' POCO X5 5G 印度版'},
    {'model': '22101320G', 'name': ' POCO X5 Pro 5G 国际版'},
    {'model': '22101320I', 'name': ' POCO X5 Pro 5G 印度版'},
    {'model': 'M2004J19PI', 'name': ' POCO M2 印度版'},
    {'model': 'M2003J6CI', 'name': ' POCO M2 Pro 印度版'}, {'model': 'M2010J19CG', 'name': ' POCO M3 国际版'},
    {'model': 'M2010J19CT', 'name': ' POCO M3 泰国版'}, {'model': 'M2010J19CI', 'name': ' POCO M3 印度版'},
    {'model': 'M2103K19PI', 'name': ' POCO M3 Pro 5G 印度版'},
    {'model': '22041219PG', 'name': ' POCO M4 5G 国际版'},
    {'model': '22041219PI', 'name': ' POCO M4 5G 印度版'},
    {'model': '2201117PG', 'name': ' POCO M4 Pro 国际版'},
    {'model': '2201117PI', 'name': ' POCO M4 Pro 印度版'},
    {'model': '21091116AG', 'name': ' POCO M4 Pro 5G 国际版'},
    {'model': '22031116AI', 'name': ' POCO M4 Pro 5G 印度版'},
    {'model': '22071219CG', 'name': ' POCO M5 国际版'},
    {'model': '22071219CI', 'name': ' POCO M5 印度版'}, {'model': '2207117BPG', 'name': ' POCO M5s 国际版'},
    {'model': '23076PC4BI', 'name': ' POCO M6 Pro 5G 印度版'},
    {'model': 'M2006C3MI', 'name': ' POCO C3 印度版'},
    {'model': '211033MI', 'name': ' POCO C31 印度版'}, {'model': '220333QPG', 'name': ' POCO C40 国际版'},
    {'model': '220333QPI', 'name': ' POCO C40 印度版'},
    {'model': '220733SPH 220733SPI', 'name': ' POCO C50 印度版'},
    {'model': '2305EPCC4G', 'name': ' POCO C51 国际版'}, {'model': '22127PC95G', 'name': ' POCO C55 国际版'},
    {'model': 'XMWT01', 'name': ' 小米手表'}, {'model': 'FYJ01QP', 'name': ' 小米米家翻译机'},
    {'model': '21051191C', 'name': ' CyberDog 仿生四足机器人'}]
const basicRequestHeaders_1 = {
    "Accept-Language": "zh",
    "Content-Type": "application/json; charset=utf-8",
    "Host": "user.mypikpak.com",
    "Connection": "Keep-Alive",
    "Accept-Encoding": "gzip",
    "content-type": "application/json"
};
const deviceName = 'XIAOMI'
const deviceModel = uaList[Math.floor(Math.random() * uaList.length)].model
const client = "YNxT9w7GMdWvEOKa";
const xid = uuidv4().replace(/-/g, '');
const t = String(Date.now());
const key = getUAKey()
const ua = getUserAgent(key)
const sign = getSign()
const pwd = 'pw123456'

function main() {
      init()
        .then(result => getImage(result))
        .then(result => getNewToken(result))
        .then(result => verification(result))
        .then(result => getCode(result))
        .then(result => verify(result))
        .then(result => init1(result))
        .then(result => signup(result))
        .then(result => init2(result))
        .then(result => invite(result))
        .then(result => activationCode(result))
        .then(result => {
            console.log("结果:", result.popup.title.text + "，" + result.popup.description.text)
        })
}

main();


