copy_docs_assets:
	cp components/bootstrap/dist/css/bootstrap.min.css _jekyll/css/bootstrap.min.css
	cp components/respond/respond.min.js _jekyll/js/respond.min.js
	cp -r components/bootstrap/dist/fonts _jekyll/fonts

serve_docs:
	jekyll serve --watch -s _jekyll/ -d docs/

build_docs:
	jekyll build -s _jekyll/ -d docs/

pages:
	cd gh-pages; git pull origin gh-pages
	rsync --exclude .git --delete -rv _jekyll/ gh-pages/
	cd gh-pages; git add -u .
	cd gh-pages; git add .
	cd gh-pages; git commit -m "Updated gh-pages."
	cd gh-pages; git push origin gh-pages

pages_setup:
	mkdir gh-pages
	git init gh-pages
	cd gh-pages; git remote add origin https://github.com/fk/select2-bootstrap-css.git
	cd gh-pages; git checkout -b gh-pages
