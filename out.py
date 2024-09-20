import re

# 正则表达式，用来匹配 'output/' 和 '.txt' 之后的数字
pattern = re.compile(r'output/(.*?)\.txt \d+')

# 读取文件内容
file_path = '查重.txt'  # 替换成您的文件路径
with open(file_path, 'r', encoding='utf-8') as file:
    lines = file.readlines()

# 对每一行进行处理
new_lines = []
for line in lines:
    # 替换匹配的字符串为所需格式
    new_line = pattern.sub(r'\1', line)
    new_lines.append(new_line.strip())

# 输出处理后的内容
for line in new_lines:
    print(line)

# 可选: 将处理后的内容写入新文件
output_file_path = 'output.txt'  # 替换成您想要的输出文件路径
with open(output_file_path, 'w', encoding='utf-8') as output_file:
    for line in new_lines:
        output_file.write(line + '\n')
