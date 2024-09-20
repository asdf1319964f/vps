#!/bin/bash

logFilePath="out.txt"

declare -A filePaths

# 读取日志文件
while IFS= read -r line; do
    trimmed_line=$(echo "$line" | xargs)
    if [[ $trimmed_line == File:* ]]; then
        currentFileName=${trimmed_line:6}
    elif [[ $trimmed_line == -* ]]; then
        filePath=${trimmed_line:2}
        filePaths["$currentFileName"]+="$filePath "
    fi
done < "$logFilePath"

# 删除后续文件，只保留第一个文件
for paths in "${filePaths[@]}"; do
    IFS=' ' read -r -a pathArray <<< "$paths"
    for (( i=1; i<${#pathArray[@]}; i++ )); do
        fileToDelete=${pathArray[$i]}
        if [ -e "$fileToDelete" ]; then
            rm "$fileToDelete"
            if [ $? -eq 0 ]; then
                echo "Deleted file: $fileToDelete"
            else
                echo "Error deleting file: $fileToDelete"
            fi
        else
            echo "File not found: $fileToDelete"
        fi
    done
done
