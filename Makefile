build:
	browserify js/main.js -t babelify --outfile js/build/build.js

serve:
	http-server -p 6666
