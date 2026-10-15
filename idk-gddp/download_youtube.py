#!/usr/bin/env python3
import sys
import os
import subprocess

def download_video(url, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    outtmpl = os.path.join(output_dir, "%(title)s.%(ext)s")
    
    cmd = [
        sys.executable, "-m", "yt_dlp",
        "--format", "bestvideo+bestaudio/best",
        "--merge-output-format", "mp4",
        "--write-subs",
        "--write-auto-subs",
        "--sub-langs", "vi.*",
        "--embed-subs",
        "--add-metadata",
        "--ignore-errors",
        "-o", outtmpl,
        url
    ]
    
    print(f"=== Đang tải video: {url} ===")
    print(f"Lưu vào thư mục: {output_dir}")
    result = subprocess.run(cmd)
    if result.returncode == 0:
        print(f"=== Tải thành công: {url} ===\n")
    else:
        print(f"=== Kết thúc tải: {url} (mã: {result.returncode}) ===\n")
    return result.returncode

def main():
    if len(sys.argv) < 3:
        print("Sử dụng: python3 download_youtube.py <url> <output_folder>")
        sys.exit(1)
    url = sys.argv[1]
    out_dir = sys.argv[2]
    sys.exit(download_video(url, out_dir))

if __name__ == "__main__":
    main()
