import httpx
from bs4 import BeautifulSoup as bs
import time
import csv
import os

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50",
    "content-type": "text/html; charset=utf-8",
}

# 模拟数据库初始化
last_request_time = None
all_data = []

def init_API():
    global last_request_time
    last_request_time = time.time()
    print('数据库已初始化！')

def fetch_page(url):
    global last_request_time
    current_time = time.time()
    
    if last_request_time is None or current_time - last_request_time >= 3:
        last_request_time = current_time

        res = httpx.get(url, headers=headers).text
        soup = bs(res, 'html.parser')
        List = soup.find("div", class_="movie-list")
        
        if not List:
            return {'error': 'No results found'}
        
        Items = List.find_all("div", class_="item")
        FH_data = []
        
        for item in Items:
            url = item.find('a').get("href")
            title = item.find('a').get("title")
            fh = item.find('strong').text
            meta = item.find('div', class_='meta').text.replace(" ", "").replace('\n', '')
            score = item.find('span', class_='value').text.replace(u"\xa0", u"").replace(" ", "").replace('\n', '')
            img = item.find('img').get("src")
            FH_data.append({
                "url": f"https://javdb.com{url}",
                "title": title,
                "fh": fh,
                "meta": meta,
                "score": score,
                "img": img})
        
        return FH_data
    else:
        return {'error': 'Too many requests, please try again later'}

def save_to_csv(data, filename):
    if not os.path.exists('data'):
        os.makedirs('data')
    
    with open(f'data/{filename}.csv', 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=data[0].keys())
        writer.writeheader()
        for item in data:
            writer.writerow(item)

def read_fhs_from_file(filename):
    with open(filename, 'r', encoding='utf-8') as file:
        return [line.strip() for line in file.readlines()]

def main():
    global all_data
    init_API()
    input_type = input("请输入输入类型（link 或 file）: ")
    
    if input_type == "link":
        base_url = input("请输入基础链接: ")
        max_pages = 20  # 最大页数
        
        for page in range(1, max_pages + 1):
            url = f"{base_url}?page={page}"
            results = fetch_page(url)
            if 'error' in results:
                print(results['error'])
                break
            else:
                all_data.extend(results)
                print(f"第 {page} 页数据已添加到总数据集中，当前数据条数: {len(all_data)}")
                time.sleep(3)  # 确保每次请求之间至少间隔3秒
    
    elif input_type == "file":
        fhs_filename = input("请输入番号列表文件名: ")
        fhs = read_fhs_from_file(fhs_filename)
        
        for fh in fhs:
            url = f"https://javdb.com/search?q={fh}&f=all"
            results = fetch_page(url)
            if 'error' in results:
                print(results['error'])
            else:
                for item in results:
                    # 检查是否存在重复项，如果存在则覆盖
                    found = False
                    for i, data_item in enumerate(all_data):
                        if data_item['fh'] == item['fh']:
                            all_data[i] = item
                            found = True
                            break
                    if not found:
                        all_data.append(item)
                print(f"番号 {fh} 的数据已添加到总数据集中，当前数据条数: {len(all_data)}")
                time.sleep(3)  # 确保每次请求之间至少间隔3秒
    
    if all_data:
        save_to_csv(all_data, 'all_results')
        print(f"所有数据已保存到 data/all_results.csv")

if __name__ == '__main__':
    main()
