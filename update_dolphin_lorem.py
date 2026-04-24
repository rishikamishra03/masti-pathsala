import os
import urllib.request

assets_dir = r"c:\Users\miris\masti-pathsala\src\assets\safari"
filepath = os.path.join(assets_dir, "dolphin.jpg")

# Using loremflickr with ocean and dolphin tags to ensure a real animal photo
url = "https://loremflickr.com/800/800/dolphin,ocean?lock=10"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
        out_file.write(response.read())
    print(f"SUCCESSfully updated Dolphin with a real photograph from LoremFlickr!")
except Exception as e:
    print(f"FAILED to update Dolphin: {e}")
