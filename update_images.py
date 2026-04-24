import os
import urllib.request

assets_dir = r"c:\Users\miris\masti-pathsala\src\assets\safari"

updates = {
    "cheetah.jpg": "https://loremflickr.com/800/800/cheetah?lock=30",
    "dolphin.jpg": "https://loremflickr.com/800/800/dolphin?lock=30"
}

for filename, url in updates.items():
    filepath = os.path.join(assets_dir, filename)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
            out_file.write(response.read())
        print(f"SUCCESSfully updated: {filename}")
    except Exception as e:
        print(f"FAILED to update {filename}: {e}")
