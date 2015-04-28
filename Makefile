build:
	browserify js/main.es6 -t babelify --outfile js/build/build.js

watch:
	watchify js/main.es6 -t babelify -o js/build/build.js -v

serve:
	http-server -p 8555
