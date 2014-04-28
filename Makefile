all: start
test: update start
dist: compile binary
.PHONY: compile start

compile:
	mkdir -p bin
	zip -r -q bin/app.nw index.html package.json app lib css node_modules

update:
	mkdir -p bin
	zip -r -q bin/app.nw index.html package.json app css
	
start:
	nw .

binary:
	cat /usr/bin/nw bin/app.nw > bin/app && chmod +x bin/app
