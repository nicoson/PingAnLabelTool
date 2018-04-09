./node_modules/uglify-js-es6/bin/uglifyjs ./dev/javascript/app.js -c -m -o ./dev/javascript/app.js
./node_modules/uglify-js-es6/bin/uglifyjs ./dev/javascript/labeltool.js -c -m -o ./dev/javascript/labeltool.js

cp -r ./dev/ ../server/public/
cp ./dev/index.html ../server/views/index.ejs