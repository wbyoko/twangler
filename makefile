#compress-js-simple compress-js-advanced deploy-local deploy-prod
all: deploy-prod

deploy-local: html css compress-js-advanced
	@echo "Copying temp files into www folder"
	@mkdir -p www
	@cp tmp/html/* www
	@mkdir -p www/css
	@cp tmp/css/*.css www/css
	@mkdir -p www/js
	@cp tmp/js/*.js www/js

deploy-local-plus: deploy-local
	@rm -rf www/twangler.html
	@php www-src/php/index.php >> www/twangler.html

deploy-prod: deploy-local-plus
	@scp www/twangler.html wbagayok@wbyoko.com:/home6/wbagayok/public_html/twangler/index.html

styling: html css js-compiled
	@echo "Copying temp files into www folder"
	@mkdir -p www
	@cp tmp/html/* www
	@mkdir -p www/css
	@cp tmp/css/*.css www/css
	@mkdir -p www/js
	@cp tmp/js/*.js www/js
	@open www/index.n.html
	@echo "Build Complete"

debug: html css compress-js-simple
	@echo "Copying temp files into www folder"
	@mkdir -p www
	@cp tmp/html/* www
	@mkdir -p www/css
	@cp tmp/css/*.css www/css
	@mkdir -p www/js
	@cp tmp/js/*.js www/js
	@cp tmp/js/*.map www/js
	@echo "//@ sourceMappingURL=main.min.js.map" >> www/js/main.min.js
	@open www/index.d.html

prod: html css compress-js-advanced
	@echo "Copying temp files into www folder"
	@mkdir -p www
	@cp tmp/html/* www
	@mkdir -p www/css
	@cp tmp/css/*.css www/css
	@mkdir -p www/js
	@cp tmp/js/*.js www/js
	@cp tmp/js/*.map www/js
	@echo "//@ sourceMappingURL=main.xmin.js.map" >> www/js/main.xmin.js
	@open www/index.c.html
	@echo "Build Complete"

clean:
	@rm -rf tmp www
	@echo "All clean!"

# Compress the javascript using advanced optimizations
# optional optimization flags for no legacy IE support
# --define='goog.userAgent.ASSUME_MOBILE_WEBKIT=true' --define='goog.userAgent.jscript.ASSUME_NO_JSCRIPT=true'
compress-js-advanced: js-compiled
	@echo "Compiling JavaScript with advanced optimizations"
	@java -jar closure/compiler/compiler.jar \
		--warning_level VERBOSE \
		--js tmp/js/main.js \
		--js closure/library/closure/goog/deps.js \
		--js tmp/css/renaming_map.c.js \
		--externs www-src/externs/application.js \
		--externs www-src/externs/google_analytics_api.js \
		--create_source_map tmp/js/main.xmin.js.map \
		--source_map_format=V3 \
		--js_output_file tmp/js/main.xmin.js \
		--compilation_level ADVANCED_OPTIMIZATIONS

#Compress the js using simple optimizations
compress-js-simple: js-compiled
	@echo "Compiling JavaScript with simple optimizations"
	@java -jar closure/compiler/compiler.jar \
		--warning_level VERBOSE \
		--js tmp/js/main.js \
		--js closure/library/closure/goog/deps.js \
		--js tmp/css/renaming_map.d.js \
		--formatting=pretty_print \
		--formatting=print_input_delimiter \
		--externs www-src/externs/application.js \
		--externs www-src/externs/google_analytics_api.js \
		--create_source_map tmp/js/main.min.js.map \
		--source_map_format=V3 \
		--js_output_file tmp/js/main.min.js \
		--compilation_level SIMPLE_OPTIMIZATIONS

# Run the closure templates compiler on the templates folder
js-templates:
	@echo "Compiling JavaScript templates"
	@mkdir -p tmp/js
	@java -jar closure/templates/SoyToJsSrcCompiler.jar \
		--outputPathFormat tmp/templates/templates.js \
		--shouldProvideRequireSoyNamespaces \
		--shouldGenerateJsdoc \
    	--cssHandlingScheme GOOG \
		www-src/templates/*.soy

# Assemble the scripts file by looking at the main JS file and pulling in any necessary dependencies
js-compiled: www-src/js/main.js js-templates
	@echo "Combining JavaScript dependencies"
	@mkdir -p tmp/j
	@closure/library/closure/bin/build/closurebuilder.py \
	 	--input=www-src/js/main.js \
		--root=closure/library/closure/ \
		--root=closure/library/third_party/closure/ \
		--root=closure/templates \
		--root=www-src/js \
		--root=tmp/templates \
		--output_mode=script \
		--output_file=tmp/js/main.js

# Compile Closure stylesheets
css:
	@echo "CSS Start"
	@mkdir -p tmp/css
	@echo "sass to css"
	@compass compile www-src/css/twangler www-src/css/twangler/sass/screen.sass
	@echo "css, symbols to renaming map"
	@java -jar closure/stylesheets/closure-stylesheets.jar \
		--allowed-unrecognized-property -webkit-overflow-scrolling \
		--allowed-unrecognized-property -ms-border-radius \
		--allowed-unrecognized-property -o-border-radius \
		--allowed-non-standard-function color-stop \
		--allowed-non-standard-function progid:DXImageTransform.Microsoft.Alpha \
    	--output-renaming-map-format CLOSURE_COMPILED \
		-o tmp/css/temp.tcss \
    	--rename CLOSURE \
    	--output-renaming-map tmp/css/renaming_map.c.js \
		www-src/css/twangler/stylesheets/screen.css \
		www-src/css/symbols/symbols.gss
	@java -jar closure/stylesheets/closure-stylesheets.jar \
		--allowed-unrecognized-property -webkit-overflow-scrolling \
		--allowed-unrecognized-property -ms-border-radius \
		--allowed-unrecognized-property -o-border-radius \
		--allowed-non-standard-function color-stop \
		--allowed-non-standard-function progid:DXImageTransform.Microsoft.Alpha \
    	--output-renaming-map-format CLOSURE_COMPILED \
		-o tmp/css/temp.tcss \
    	--rename DEBUG \
    	--output-renaming-map tmp/css/renaming_map.d.js \
		www-src/css/twangler/stylesheets/screen.css \
		www-src/css/symbols/symbols.gss
	@echo "main.gss to css"
	@java -jar closure/stylesheets/closure-stylesheets.jar \
		-o tmp/css/main.c.css \
    	--rename CLOSURE \
		--allowed-unrecognized-property -webkit-overflow-scrolling \
		--allowed-unrecognized-property -ms-border-radius \
		--allowed-unrecognized-property -o-border-radius \
		--allowed-non-standard-function color-stop \
		--allowed-non-standard-function progid:DXImageTransform.Microsoft.Alpha \
		www-src/css/twangler/stylesheets/screen.css
	@java -jar closure/stylesheets/closure-stylesheets.jar \
		-o tmp/css/main.d.css \
    	--rename DEBUG \
		--allowed-unrecognized-property -webkit-overflow-scrolling \
		--allowed-unrecognized-property -ms-border-radius \
		--allowed-unrecognized-property -o-border-radius \
		--allowed-non-standard-function color-stop \
		--allowed-non-standard-function progid:DXImageTransform.Microsoft.Alpha \
		www-src/css/twangler/stylesheets/screen.css
	@java -jar closure/stylesheets/closure-stylesheets.jar \
		-o tmp/css/main.n.css \
    	--rename NONE \
		--allowed-unrecognized-property -webkit-overflow-scrolling \
		--allowed-unrecognized-property -ms-border-radius \
		--allowed-unrecognized-property -o-border-radius \
		--allowed-non-standard-function color-stop \
		--allowed-non-standard-function progid:DXImageTransform.Microsoft.Alpha \
		www-src/css/twangler/stylesheets/screen.css

# Copy HTML files into compiled directory
html:
	@echo "Copying HTML"
	@mkdir -p tmp/html
	@cp www-src/html/*.html tmp/html/