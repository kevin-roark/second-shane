build:
	browserify js/main.js > js/build/build.js

serve:
	http-server -p 6666
