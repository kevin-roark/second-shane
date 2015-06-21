build:
	browserify js/main.es6 -t babelify --outfile js/build/build.js

watch:
	watchify js/main.es6 -v -t babelify -o js/build/build.js

serve:
	serve -p 8555
