new_image = Image.new('RGBA', size=(5 * size[0], 9 * size[1]))
for img in images:
	png_info = img.info
	image1_size = img.size
	image2_size = image2.size
	new_image.paste(image1,(0,0))
	new_image.paste(image2,(image1_size[0],0))
	new_image.save("images/merged_image.jpg","JPEG")
	new_image.show()