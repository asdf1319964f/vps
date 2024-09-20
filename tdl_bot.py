import os
import subprocess
import re
import time
import threading
import json
from queue import Queue
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ParseMode
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters, CallbackContext, CallbackQueryHandler
from telegram.error import BadRequest, TimedOut, RetryAfter

# 全局变量
TOKEN = '1605227081:AAFy1kUlMCR0qbhY_yJ8mH-BXjdWjAEX5Q8'
ADMIN_ID = 712567688
download_queue = Queue(maxsize=5)  # 限制队列大小为5
active_downloads = {}
TARGET_FOLDER = "/root/down"  # 请根据实际情况修改这个路径

def create_progress_bar(progress):
    bar_length = 20
    filled_length = int(bar_length * progress // 100)
    bar = '█' * filled_length + '░' * (bar_length - filled_length)
    return f'[{bar}] {progress}%'

def update_progress(context: CallbackContext, chat_id, message_id, process, file_name):
    last_progress = 0
    last_update_time = 0
    for line in iter(process.stdout.readline, ''):
        match = re.search(r'(\d+)%', line)
        if match:
            progress = int(match.group(1))
            current_time = time.time()
            if progress != last_progress and current_time - last_update_time >= 5:
                progress_bar = create_progress_bar(progress)
                progress_text = f'下载进度 ({file_name}): {progress_bar}'
                keyboard = [[InlineKeyboardButton("取消下载", callback_data=f'cancel_{message_id}')]]
                reply_markup = InlineKeyboardMarkup(keyboard)
                try:
                    context.bot.edit_message_text(chat_id=chat_id, message_id=message_id, text=progress_text, reply_markup=reply_markup)
                except (BadRequest, TimedOut, RetryAfter) as e:
                    if isinstance(e, RetryAfter):
                        time.sleep(e.retry_after)
                        context.bot.edit_message_text(chat_id=chat_id, message_id=message_id, text=progress_text, reply_markup=reply_markup)
                    elif 'Message is not modified' not in str(e):
                        print(f"Error updating progress: {e}")
                last_progress = progress
                last_update_time = current_time
    if process.poll() is not None:
        return

def update_rclone_progress(context: CallbackContext, chat_id, message_id, process):
    last_progress = 0
    last_update_time = 0
    for line in iter(process.stdout.readline, ''):
        match = re.search(r'Transferred:.*$(\d+)%$', line)
        if match:
            progress = int(match.group(1))
            current_time = time.time()
            if progress != last_progress and current_time - last_update_time >= 5:
                progress_bar = create_progress_bar(progress)
                progress_message = f'上传进度: {progress_bar}'
                try:
                    context.bot.edit_message_text(chat_id=chat_id, message_id=message_id, text=progress_message, parse_mode=ParseMode.MARKDOWN)
                except (RetryAfter, BadRequest) as e:
                    if isinstance(e, RetryAfter):
                        time.sleep(e.retry_after)
                        context.bot.edit_message_text(chat_id=chat_id, message_id=message_id, text=progress_message, parse_mode=ParseMode.MARKDOWN)
                    elif 'Message is not modified' not in str(e):
                        print(f"Error updating rclone progress: {e}")
                last_progress = progress
                last_update_time = current_time
    if process.poll() is not None:
        return

def handle_download(context: CallbackContext, chat_id, tdl_url, use_takeout=False):
    download_dir = '/root/down'
    
    file_name = tdl_url.split('/')[-1]
    
    command = f'tdl dl -u {tdl_url} {"--takeout" if use_takeout else "-t 8 -s 524288 -l 4"} -d {download_dir}'

    try:
        message = context.bot.send_message(chat_id=chat_id, text=f'开始下载 {file_name}，请稍等...')
        message_id = message.message_id
        process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
        active_downloads[message_id] = process

        update_progress(context, chat_id, message_id, process, file_name)
        process.wait()

        if process.returncode == 0:
            context.bot.send_message(chat_id=chat_id, text=f'{file_name} 下载完成！')

            rclone_command = f'rclone move {download_dir} p:tdl --checkers=16 --transfers=8 --cache-chunk-size 256M --cache-chunk-total-size 100G --ignore-errors --checksum --disable-http2 --onedrive-delta -P'
            upload_message = context.bot.send_message(chat_id=chat_id, text='开始上传，请稍等...')
            upload_message_id = upload_message.message_id
            rclone_process = subprocess.Popen(rclone_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)

            update_rclone_progress(context, chat_id, upload_message_id, rclone_process)
            rclone_process.wait()

            if rclone_process.returncode == 0:
                context.bot.send_message(chat_id=chat_id, text='上传完成！')
            else:
                context.bot.send_message(chat_id=chat_id, text='上传失败：' + rclone_process.stderr.read())
        else:
            error_output = process.stderr.read()
            context.bot.send_message(chat_id=chat_id, text=f'{file_name} 下载失败：' + error_output)

    except Exception as e:
        context.bot.send_message(chat_id=chat_id, text=f'{file_name} 下载失败：{e}')
    finally:
        if message_id in active_downloads:
            del active_downloads[message_id]
        download_queue.task_done()

def cancel_download(update: Update, context: CallbackContext) -> None:
    query = update.callback_query
    query.answer()
    
    message_id = int(query.data.split('_')[1])
    if message_id in active_downloads:
        process = active_downloads[message_id]
        process.terminate()
        del active_downloads[message_id]
        query.edit_message_text(text="下载已取消。")
    else:
        query.edit_message_text(text="无法取消下载，可能已完成或已取消。")

def handle_message(update: Update, context: CallbackContext) -> None:
    if update.message.chat.id != ADMIN_ID:
        update.message.reply_text('抱歉，您没有使用此机器人的权限。')
        return

    tdl_url = update.message.text
    if tdl_url.startswith('https://t.me/'):
        if download_queue.full():
            update.message.reply_text('当前下载任务已满，请稍后再试。')
        else:
            download_queue.put((update.message.chat.id, tdl_url, False))
            update.message.reply_text('下载任务已添加到队列。')
            threading.Thread(target=handle_download, args=(context, update.message.chat.id, tdl_url)).start()
    else:
        update.message.reply_text('请发送有效的Telegram链接。')

def handle_takeout_download(update: Update, context: CallbackContext) -> None:
    if update.message.chat.id != ADMIN_ID:
        update.message.reply_text('抱歉，您没有使用此机器人的权限。')
        return

    if not context.args:
        update.message.reply_text('请提供Telegram链接。使用方法：/takeout <链接>')
        return

    tdl_url = context.args[0]
    if tdl_url.startswith('https://t.me/'):
        if download_queue.full():
            update.message.reply_text('当前下载任务已满，请稍后再试。')
        else:
            download_queue.put((update.message.chat.id, tdl_url, True))
            update.message.reply_text('低速下载任务已添加到队列。')
            threading.Thread(target=handle_download, args=(context, update.message.chat.id, tdl_url, True)).start()
    else:
        update.message.reply_text('请发送有效的Telegram链接。')

def handle_export_chat(update: Update, context: CallbackContext) -> None:
    if update.message.chat.id != ADMIN_ID:
        update.message.reply_text('抱歉，您没有使用此机器人的权限。')
        return

    if len(context.args) < 3:
        update.message.reply_text('请提供频道ID、起始消息ID和结束消息ID。\n使用方法：/export <频道ID> <起始消息ID> <结束消息ID> [目标文件夹]')
        return

    tdl_id = context.args[0]
    start_id = context.args[1]
    end_id = context.args[2]
    output_file = f"export_{tdl_id}_{start_id}_{end_id}.json"

    if len(context.args) >= 4:
        target_folder = context.args[3]
    else:
        target_folder = TARGET_FOLDER

    chat_id = update.message.chat.id
    message = update.message.reply_text('开始导出聊天记录...')
    
    try:
        # 导出聊天记录
        export_command = f'tdl chat export "{tdl_id}" -T time -i {start_id} {end_id} -o {output_file}'
        context.bot.send_message(chat_id=chat_id, text=f"执行导出命令: {export_command}")
        
        export_result = subprocess.run(export_command, shell=True, capture_output=True, text=True)
        
        if export_result.returncode == 0:
            context.bot.send_message(chat_id=chat_id, text="聊天记录已导出到 JSON 文件。开始下载...")
            
            # 下载文件
            download_command = f'tdl dl -f {download_dir}'
            context.bot.send_message(chat_id=chat_id, text=f"执行下载命令: {download_command}")
            
            download_result = subprocess.run(download_command, shell=True, capture_output=True, text=True)
            
            if download_result.returncode == 0:
                context.bot.send_message(chat_id=chat_id, text="文件下载完成。开始上传到 Telegram...")
                
                # 上传到 Telegram
                upload_command = f'tdl up -p "{output_folder}" -c musakings'
                context.bot.send_message(chat_id=chat_id, text=f"执行上传命令: {upload_command}")
                
                upload_result = subprocess.run(upload_command, shell=True, capture_output=True, text=True)
                
                if upload_result.returncode == 0:
                    context.bot.send_message(chat_id=chat_id, text=f"文件已成功上传到 Telegram 路径")
                else:
                    error_message = upload_result.stderr.strip() if upload_result.stderr else "未知错误"
                    context.bot.send_message(chat_id=chat_id, text=f"上传失败:\n错误信息: {error_message}")
                
                # 删除本地文件
                os.remove(output_file)
                context.bot.send_message(chat_id=chat_id, text="本地文件已删除。")
            else:
                error_message = download_result.stderr.strip() if download_result.stderr else "未知错误"
                context.bot.send_message(chat_id=chat_id, text=f"下载失败:\n错误信息: {error_message}")
        else:
            error_message = export_result.stderr.strip() if export_result.stderr else "未知错误"
            context.bot.send_message(chat_id=chat_id, text=f"导出失败:\n错误信息: {error_message}")
        
    except Exception as e:
        context.bot.send_message(chat_id=chat_id, text=f"发生异常: {str(e)}")

def handle_download_exported(update: Update, context: CallbackContext) -> None:
    if update.message.chat.id != ADMIN_ID:
        update.message.reply_text('抱歉，您没有使用此机器人的权限。')
        return

    if not os.path.exists('result.json'):
        update.message.reply_text('没有找到导出的聊天记录文件。请先使用 /export 命令导出聊天记录。')
        return

    chat_id = update.message.chat.id
    message = update.message.reply_text('开始处理导出的聊天记录...')

    download_command = 'tdl dl -f result.json'
    process = subprocess.Popen(download_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)

    last_progress = 0
    last_update_time = 0

    for line in iter(process.stdout.readline, ''):
        match = re.search(r'(\d+)%', line)
        if match:
            progress = int(match.group(1))
            current_time = time.time()
            if progress != last_progress and current_time - last_update_time >= 5:
                progress_bar = create_progress_bar(progress)
                progress_text = f'下载进度: {progress_bar}'
                try:
                    context.bot.edit_message_text(chat_id=chat_id, message_id=message.message_id, text=progress_text)
                except (BadRequest, TimedOut, RetryAfter) as e:
                    if isinstance(e, RetryAfter):
                        time.sleep(e.retry_after)
                        context.bot.edit_message_text(chat_id=chat_id, message_id=message.message_id, text=progress_text)
                    elif 'Message is not modified' not in str(e):
                        print(f"Error updating progress: {e}")
                last_progress = progress
                last_update_time = current_time

    process.wait()

    if process.returncode == 0:
        context.bot.send_message(chat_id=chat_id, text='所有文件下载完成！')
    else:
        error_output = process.stderr.read()
        context.bot.send_message(chat_id=chat_id, text=f'下载过程中出现错误：{error_output}')

def start(update: Update, context: CallbackContext) -> None:
    welcome_message = (
        "欢迎使用下载机器人！\n"
        "这个机器人可以帮助你下载 Telegram 文件和导出聊天记录。\n"
        "使用 /help 命令查看详细使用说明。"
    )
    update.message.reply_text(welcome_message)

def help(update: Update, context: CallbackContext) -> None:
    help_message = (
        "下载机器人使用说明：\n"
        "1. 直接下载：\n"
        "   发送 Telegram 链接即可开始下载。\n"
        "2. 低速下载：\n"
        "   使用命令 /takeout <链接> 进行低速下载。\n"
        "   例如：/takeout https://t.me/channel/1234\n"
        "3. 导出聊天记录：\n"
        "   使用命令 /export <频道ID> <起始消息ID> <结束消息ID> [目标文件夹] 导出指定范围的聊天记录。\n"
        "   例如：/export -1001234567890 1000 2000\n"
        "4. 下载导出的文件：\n"
        "   使用命令 /download_exported 下载已导出的聊天记录中的文件。\n"
        "5. 取消下载：\n"
        "   在下载进度消息中点击\"取消下载\"按钮。\n"
        "注意：\n"
        "- 同时最多支持 5 个下载任务。\n"
        "- 下载完成后，文件会自动上传到指定的云存储。\n"
        "- 只有管理员可以使用此机器人。"
    )
    update.message.reply_text(help_message)

def error_handler(update: Update, context: CallbackContext) -> None:
    """Log Errors caused by Updates."""
    print(f'Update "{update}" caused error "{context.error}"')

def main() -> None:
    updater = Updater(TOKEN)
    dp = updater.dispatcher

    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(CommandHandler("help", help))
    dp.add_handler(CommandHandler("takeout", handle_takeout_download))
    dp.add_handler(CommandHandler("export", handle_export_chat))
    dp.add_handler(CommandHandler("download_exported", handle_download_exported))
    dp.add_handler(MessageHandler(Filters.text & ~Filters.command, handle_message))
    dp.add_handler(CallbackQueryHandler(cancel_download, pattern='^cancel_'))

    dp.add_error_handler(error_handler)

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
