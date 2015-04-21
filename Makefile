build:
	browserify js/main.es6 -t babelify --outfile js/build/build.js

serve:
	http-server -p 8555
