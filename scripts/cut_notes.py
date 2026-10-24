import sys, io, requests
from rembg import remove, new_session
from PIL import Image
s = new_session("isnet-general-use")
for line in open("notes_urls.txt"):
    name, url = line.split()
    im = Image.open(io.BytesIO(requests.get(url, timeout=60).content)).convert("RGB")
    out = remove(im, session=s, alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=15, alpha_matting_erode_size=6)
    bbox = out.getbbox()
    if bbox: out = out.crop(bbox)
    out.thumbnail((700, 700))
    out.save(f"/app/frontend/public/images/notes/{name}.png", optimize=True)
    print(name, out.size)
