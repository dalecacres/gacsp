import requests as r
from PIL import Image
from io import BytesIO
import time

for x in range(16):
	time.sleep(1)
	# print('https://gatherer.wizards.com/Handlers/Image.ashx?size=medium&name=' + str(x) + '&type=symbol')
	image = Image.open(BytesIO(r.get('https://gatherer.wizards.com/Handlers/Image.ashx?size=medium&name=' + str(x) + '&type=symbol', verify=False).content))
	png_info = image.info
	image.save(str(x) + '.png', **png_info)