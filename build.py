#!/usr/bin/env python3
"""Le logo est désormais un SVG inline dans le template ; build = copie simple."""
import pathlib,shutil
d=pathlib.Path(__file__).parent
shutil.copyfile(d/"index.template.html", d/"index.html")
print("index.html écrit")
