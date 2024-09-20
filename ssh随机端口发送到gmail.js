//export EMAIL_USER="asdf131996455@gmail.com"
//export EMAIL_PASS="odlfbyjlpwbzdfjd"
//export EMAIL_TO="asdf131996455@gmail.com" 变量
//使用要安装npm install nodemailer
const { exec } = require('child_process');
const nodemailer = require('nodemailer');

// 生成随机端口号（1024-65535之间，避开已知端口）
const newPort = Math.floor(Math.random() * 64512 + 1024);

// 备份现有的sshd_config文件
exec('sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error backing up sshd_config: ${stderr}`);
        sendMail(`Error backing up sshd_config: ${stderr}`);
        return;
    }
    console.log('Backup of sshd_config completed.');

    // 更改端口号
    exec(`sudo sed -i "s/^#Port 22/Port ${newPort}/" /etc/ssh/sshd_config && sudo sed -i "s/^Port [0-9]*/Port ${newPort}/" /etc/ssh/sshd_config`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error changing port in sshd_config: ${stderr}`);
            sendMail(`Error changing port in sshd_config: ${stderr}`);
            return;
        }
        console.log(`Port changed to ${newPort} in sshd_config.`);

        // 重新启动SSH服务
        exec('sudo systemctl restart ssh', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error restarting SSH service: ${stderr}`);
                sendMail(`Error restarting SSH service: ${stderr}`);
                return;
            }
            console.log('SSH service restarted.');

            // 检查是否更改成功
            exec(`ss -tuln | grep -q ":${newPort}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Failed to change SSH port: ${stderr}`);
                    sendMail(`Failed to change SSH port: ${stderr}`);
                } else {
                    console.log(`SSH port changed to ${newPort} and service restarted successfully.`);
                    sendMail(`SSH port changed to ${newPort} and service restarted successfully.`);
                }
            });
        });
    });
});

// 发送邮件通知
function sendMail(message) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // 使用环境变量
            pass: process.env.EMAIL_PASS // 使用环境变量
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER, // 使用环境变量
        to: process.env.EMAIL_TO, // 使用环境变量
        subject: 'SSH Port Change Notification',
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(`Error sending email: ${error}`);
        }
        console.log(`Email sent: ${info.response}`);
    });
}
