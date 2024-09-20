import httpx
from bs4 import BeautifulSoup as bs
import time
import os
import random

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50",
    "content-type": "text/html; charset=utf-8",
}

last_request_time = None
all_fhs = set()  # 使用集合来存储唯一的番号

def init_API():
    global last_request_time, all_fhs
    last_request_time = time.time()
    if os.path.exists('data/all_fhs.txt'):
        with open('data/all_fhs.txt', 'r', encoding='utf-8') as file:
            all_fhs = set(file.read().splitlines())
    print('数据库已初始化！当前番号数量：', len(all_fhs))

def fetch_page(url, retries=3):
    global last_request_time
    current_time = time.time()
    
    if last_request_time is None or current_time - last_request_time >= 5:  # 增加等待时间到5秒
        last_request_time = current_time

        try:
            res = httpx.get(url, headers=headers, timeout=30).text
            soup = bs(res, 'html.parser')
            List = soup.find("div", class_="movie-list")
            
            if not List:
                return {'error': 'No results found'}
            
            Items = List.find_all("div", class_="item")
            FH_data = []
            
            for item in Items:
                fh = item.find('strong').text
                FH_data.append(fh)
            
            return FH_data
        except httpx.RequestError as e:
            if retries > 0:
                print(f"请求失败，正在重试... 剩余重试次数: {retries-1}")
                time.sleep(10)  # 失败后等待10秒再重试
                return fetch_page(url, retries-1)
            else:
                return {'error': f'Request failed after 3 attempts: {str(e)}'}
    else:
        return {'error': 'Too many requests, please try again later'}

def save_to_txt(data, filename):
    if not os.path.exists('data'):
        os.makedirs('data')
    
    with open(f'data/{filename}.txt', 'w', encoding='utf-8') as file:
        for item in data:
            file.write(f"{item}\n")

def read_from_file(filename):
    with open(filename, 'r', encoding='utf-8') as file:
        return [line.strip() for line in file.readlines()]

def process_link(base_url):
    global all_fhs
    max_pages = 20  # 最大页数
    
    for page in range(1, max_pages + 1):
        url = f"{base_url}?page={page}"
        results = fetch_page(url)
        if 'error' in results:
            print(results['error'])
            if 'Too many requests' in results['error']:
                print("等待60秒后继续...")
                time.sleep(60)
                continue
            break
        else:
            new_fhs = set(results) - all_fhs
            all_fhs.update(new_fhs)
            print(f"链接 {base_url} 的第 {page} 页数据已添加到总数据集中，新增番号数量: {len(new_fhs)}，当前总番号数量: {len(all_fhs)}")
            if new_fhs:
                save_to_txt(all_fhs, 'all_fhs')
            wait_time = random.uniform(5, 10)  # 随机等待5-10秒
            print(f"等待 {wait_time:.2f} 秒...")
            time.sleep(wait_time)

def main():
    global all_fhs
    init_API()
    input_type = input("请输入输入类型（link、file 或 links）: ")
    
    if input_type == "link":
        base_url = input("请输入基础链接: ")
        process_link(base_url)
    
    elif input_type == "file":
        fhs_filename = input("请输入番号列表文件名: ")
        fhs = read_from_file(fhs_filename)
        
        for fh in fhs:
            url = f"https://javdb.com/search?q={fh}&f=all"
            results = fetch_page(url)
            if 'error' in results:
                print(results['error'])
                if 'Too many requests' in results['error']:
                    print("等待60秒后继续...")
                    time.sleep(60)
                    continue
            else:
                new_fhs = set(results) - all_fhs
                all_fhs.update(new_fhs)
                print(f"番号 {fh} 的数据已添加到总数据集中，新增番号数量: {len(new_fhs)}，当前总番号数量: {len(all_fhs)}")
                if new_fhs:
                    save_to_txt(all_fhs, 'all_fhs')
                wait_time = random.uniform(5, 10)  # 随机等待5-10秒
                print(f"等待 {wait_time:.2f} 秒...")
                time.sleep(wait_time)
    
    elif input_type == "links":
        links_filename = input("请输入链接列表文件名: ")
        links = read_from_file(links_filename)
        
        for link in links:
            print(f"正在处理链接: {link}")
            process_link(link)
            wait_time = random.uniform(30, 60)  # 每个链接处理完后随机等待30-60秒
            print(f"链接处理完毕，等待 {wait_time:.2f} 秒后继续下一个链接...")
            time.sleep(wait_time)
    
    if all_fhs:
        save_to_txt(all_fhs, 'all_fhs')
        print(f"所有番号已保存到 data/all_fhs.txt")

if __name__ == '__main__':
    main()
