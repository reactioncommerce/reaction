# X-editable

In-place editing with Twitter Bootstrap, jQuery UI or pure jQuery.  

## Live demo
**http://vitalets.github.io/x-editable/demo.html**

## Documentation
**http://vitalets.github.io/x-editable**

## How to get it

### Manual download
Use **http://vitalets.github.io/x-editable** main page.

### Bower
````
bower install x-editable
````

### CDN
Bootstrap 3 build:
````js
<link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/bootstrap3-editable/css/bootstrap-editable.css" rel="stylesheet"/>
<script src="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/bootstrap3-editable/js/bootstrap-editable.min.js"></script>
````

Bootstrap 2 build:
````js
<link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/bootstrap-editable/css/bootstrap-editable.css" rel="stylesheet"/>
<script src="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/bootstrap-editable/js/bootstrap-editable.min.js"></script>
````

jQuery UI build:
````js
<link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/jqueryui-editable/css/jqueryui-editable.css" rel="stylesheet"/>
<script src="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/jqueryui-editable/js/jqueryui-editable.min.js"></script>
````

jQuery only build:
````js
<link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/jquery-editable/css/jquery-editable.css" rel="stylesheet"/>
<script src="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/jquery-editable/js/jquery-editable-poshytip.min.js"></script>
````


## Reporting issues
Please **provide jsFiddle** when creating issues!   
It's really saves much time. Use these as template:   
1. [jsFiddle Bootstrap 3](http://jsfiddle.net/xBB5x/2265/)  
2. [jsFiddle Bootstrap 2](http://jsfiddle.net/xBB5x/1817/)  
3. [jsFiddle jQuery-ui](http://jsfiddle.net/xBB5x/2511/)  
4. [jsFiddle jQuery](http://jsfiddle.net/xBB5x/197)    
Your feedback is very appreciated!

## Contribution
A few steps how to start contributing.  
Assuming you have [Node.js](http://nodejs.org/) already installed.

1.Fork *X-editable* on github and clone it to your local mashine:
````
git clone https://github.com/<your-github-name>/x-editable.git -b dev
````
2.Install *grunt-cli* globally (if not yet):
````
npm i -g grunt-cli
````
3.Install dependencies:  
````
cd x-editable
npm i
````
4.Make your changes:  
````
vim editable-form.js
````
5.Write some tests for your changes:
````
vim /test/unit/*.js
````
6.Run tests in cli:  
````
grunt test
````
or directly in browser:
````
grunt server
````
and open http://127.0.0.1:8000/test  
By default test run on bootstrap 3 popup version, but you can test any other build:  

* bootstrap 3
  * popup: http://127.0.0.1:8000/test/?f=bootstrap3&c=popup  
  * inline: http://127.0.0.1:8000/test/?f=bootstrap3&c=inline  
* bootstrap 2
  * popup: http://127.0.0.1:8000/test/?f=bootstrap2&c=popup 
  * inline: http://127.0.0.1:8000/test/?f=bootstrap2&c=inline
* jquery-ui
  * popup: http://127.0.0.1:8000/test/?f=jqueryui&c=popup 
  * inline: http://127.0.0.1:8000/test/?f=jqueryui&c=inline
* jquery + poshytip
  * popup: http://127.0.0.1:8000/test/?f=plain&c=popup 
  * inline: http://127.0.0.1:8000/test/?f=plain&c=inline

7.Commit and push back on github:  
````
git add .
git commit -m'refactor editable form, fix #123'
git push origin
````
8.Make pull request on github (to `dev` branch).  
 
Thanks for your support!

### Local build
To build x-editable locally please run:
````
grunt build
````
Result will appear in `dist` directory.

## License
Copyright (c) 2012 Vitaliy Potapov  
Licensed under the MIT license.