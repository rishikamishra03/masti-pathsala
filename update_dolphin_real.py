import os
import urllib.request

assets_dir = r"c:\Users\miris\masti-pathsala\src\assets\safari"
filepath = os.path.join(assets_dir, "dolphin.jpg")

# High-quality real photograph of a dolphin from Unsplash
url = "https://images.unsplash.com/photo-1607342614391-768800938479?auto=format&fit=crop&w=800&q=80"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
        out_file.write(response.read())
    print(f"SUCCESSfully updated Dolphin with a real photograph!")
except Exception as e:
    print(f"FAILED to update Dolphin: {e}")
