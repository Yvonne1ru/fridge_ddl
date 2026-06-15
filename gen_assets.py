from pathlib import Path

def generate_assets_list(folder_path='./assets'):
    assets_dir = Path(folder_path)
    
    if not assets_dir.is_dir():
        print(f"❌ 错误: 目录 '{folder_path}' 不存在或不是文件夹。")
        return

    # 常见图片扩展名（可根据需要增删）
    image_exts = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.tiff'}

    # 获取所有图片文件，并按文件名不区分大小写排序
    image_files = sorted(
        [f for f in assets_dir.iterdir() if f.suffix.lower() in image_exts and f.is_file()],
        key=lambda x: x.name.lower()
    )

    # 按指定格式输出
    for img in image_files:
        print(f"  './assets/{img.name}',")

if __name__ == '__main__':
    generate_assets_list()