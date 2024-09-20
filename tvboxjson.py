def deduplicate_json_files(input_files, output_file):
    unique_entries = set()
    unique_data = []  # 初始化一个列表来存放最终的唯一数据
    for input_file in input_files:
        with open(input_file, 'r') as f:
            data = json.load(f)
            for entry in data:
                hash_key = hashlib.sha256(json.dumps(entry, sort_keys=True).encode('utf-8')).hexdigest()
                if hash_key not in unique_entries:
                    unique_entries.add(hash_key)
                    unique_data.append(entry)

    with open(output_file, 'w') as f:
        json.dump(unique_data, f, indent=4)

if __name__ == '__main__':
    input_files = ['input1.json', 'input2.json', 'input3.json']
    output_file = 'deduplicated_data.json'
    deduplicate_json_files(input_files, output_file)
