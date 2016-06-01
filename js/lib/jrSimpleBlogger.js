$(document).ready(function(){



/* ALL OF OUR BLOG RELATED SETUP AND TEMPLATING GO IN THIS FUNCTION*/
function jrSimpleBlog(){

	var envVars = {
		rootFolder : "/categories/",
	}




//-----------------------------------------------
	//BEGIN TEMPLATES

	/*
		TEMPLATE GENERATOR

		- TEMPLATES -
		- Search for the template tags in our body document
		- Select the number of iterations based the actual DOM nodes
		and not the other prototype properties
		- Then get the first template's link
		- call the file in the templates folder with ajax
		- on success change the result to a string so jQuery can pass
		it to the replaceWith function correctly. If not then it
		errors on node fragment
		- then on complete we subtract, then test our count.
		- if the count is still > 0, then we know we are finding
		template tags. Checking each time, allows loading multiple
		templates, that themselves may contain more template tags
		- we can load templates in templates in templates
	*/
	function buildTemplates(){
		var count = -1;
		$("body template").each(function( index ){
			count++;
		});
		
		$("body template").first().attr('link', function(){
			
			var templateLink = "/templates/" + $(this).attr('link');
			$.ajax({
				method: "GET",
				url: templateLink,
				context: this,
				success : function(result){
					var theHtml = result.toString();
					$(this).replaceWith(theHtml);
				},
				error : function(err){
					console.error("@ERROR Simple Blogger: \n Error Loading Template. \n Check <template link=''></template> tags - Make sure you are referencing a valid link and that the html file exists in the template directory. \n", err);
					alert("@ERROR Simple Blogger: \n Error Loading Template. \n Check <template link=''></template> tags - Make sure you are referencing a valid link and that the html file exists in the template directory. Check console for more information. \n", err);
					count = 0;
				},
				complete : function(info){
					if(count > 0){
						updateDOM();
						buildTemplates();
					} else {
						//Next build our static content at a folder location
						buildLists();//Only after all templates are loaded
					}
				}
			});
		});
	};//End buildTemplates
	
	function getTemplate(template){
		var templateLink = /templates/ + template;
		return $.ajax({
			method: "GET",
			url: templateLink,
			context: this
		});
	}









	//END TEMPLATES
//---------------------------------------



//---------------------------------------
	//BEGIN MEMORY MANAGEMENT
	/*
		LOCAL SESSION MANAGEMENT - localSession memory
		- This just takes care of our get/set
		- I use this to hold the posts from our root directory.
		- I don't have to rebuild the structure each page load
	*/
	function LocalSessionManagement(){
		return {
			setSessionStorage : function(posts){
				sessionStorage['posts'] = JSON.stringify(posts);
			},
			getSessionStorage : function(posts){
				var sessionObj = JSON.parse(sessionStorage.getItem(posts));
				return sessionObj;
			}
		}
	}
	
	//END MEMORY MANAGEMENT
//---------------------------------------
	



//---------------------------------------
	//BEGIN STATIC CONTENT


	/*
		Get Category Contents
		- Returns a promise that has a list of our posts 
		- categoryDOMList consists of the categories passed
		from the <list category=""> tag
		- 
		-See the buildLists() function for more information

		**TODO: you should be able to list multiple categories but it
		is not working yet
		

	*/
	function getCategoryContents(categoryDOMList){
		var deferreds = [];//Array of each ajax call for our categories
		$.each(categoryDOMList, function(index, cat){
		    deferreds.push(
		        // No success handler - don't want to trigger the deferred object
		        $.ajax({
		            method: "GET",
		            url: cat
		        })
		    );
		});
		
		// Can't pass a literal array, so use apply.
		return $.when.apply($, deferreds).then(
			function(){
			    //When all ajax calls above are finished then:
			    /*
			    Get our html out of our returned deferreds.
			    Arguments is a keyword as in arguments to 
			    the scope of this function (callback in our case)
			    */
			    results = [];
			    for(var arg in arguments){
			    	results.push(arguments[arg[0]]);
			    }
			    


			    //assign the hrefs to our postDOMlist
				var postDOMList = [];

				for(var html in results){
			    	//Return the directory URL, then grab anchor tags from the HTML
					//Then push them to an array
		    		//Store them in here
		        	$(results[html]).find("a").attr("href", function (i, val) {
		        		
		        		//remove hrefs that don't apply to us
		        		if(val.indexOf('../') !== -1 || val.indexOf('node-ecstatic') !== -1){
		        			//do not add to our array
		        		} else {
		        			postDOMList.push(val);
		        		}
		        	});
		        }

		        //Get rid of spaces and replace with dash
		        for(var i in postDOMList){
		        	//var newUrl = postDOMList[i].replace(/%20/g, "-");
		        	
		        	if(postDOMList[i].search('%20') != -1){
		        		alert("@ERROR - Simple Blog - use dashes instead of spaces in your post names. And all lower case.")
		        	}

		        }

		        return postDOMList;

		})
	};//End function
				    	

	function getPostData(postDOMList){
		var deferreds = [];//Array of each ajax call for our categories
		$.each(postDOMList, function(index, cat){
			deferreds.push(
		        // No success handler - don't want to trigger the deferred object
		        $.ajax({
		            method: "GET",
		            url: cat + "index.md"

		        })
		    );
		});
		return $.when.apply($, deferreds).then(function(){
		    results = [];
		    if(postDOMList.length > 1){
			    for(var arg in arguments){
			    	results.push(arguments[arg[0]][0]);
			    }
			} else {
				results.push(arguments[0]);
			}		    
		    return results;
		});
	};

	function parseMd(data){

		var postContainer = [];
		for(var post in data){

			var textFile = data[post].split("---");

			//Build metadata object from our file
			var metadataArray = textFile[0].split('\n');
			
			//Remove any empty strings
			for(var i = 0; i <= metadataArray.length; i++){
				if(metadataArray[i] == "" || metadataArray[i] == null || metadataArray == undefined){
					metadataArray.splice(i,1);
				}
			}

			var newObj = {};
			for(var j = 0; j <= metadataArray.length-1; j++){

				//Split metadata
				var metaKeyValue = metadataArray[j].split(/:/);//.split(":");
				
				//Get rid of any spaces at the front and end

				metaKeyValue[0] = metaKeyValue[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				metaKeyValue[1] = metaKeyValue[1].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
				//Metadata is ready

				newObj[metaKeyValue[0]] = metaKeyValue[1];
				
			}
			//Get content
			//Now handle our Markdown which is the 2nd part of our textFile
			var converter = new Showdown.converter();
			var content = converter.makeHtml(textFile[1]);

			newObj['content'] = content;

			postContainer.push(newObj);

		}//End for post in data
		return postContainer;
	};//End parseMd



	/*
		<list category="events" limit="5" page="true"></list>
		- category or folder of posts/items
			- left blank and it will show all of them
		- limit - number of posts to show (default 5)
			- number on each page is based off limit
	*/
	function buildLists(){
		$("body list").each(function( index ){
			var parentEl = $(this);
			var category = parentEl.attr('category');
			var limit = parentEl.attr('limit');
			//var paged = parentEl.attr('paged');
			var template = parentEl.attr('template');
			
			var catArray = [];
			var subArray = category.split(",");
			for(var cat in subArray){
				catArray.push(envVars.rootFolder + subArray[cat] + "/");
			}

			$.when( 
				getCategoryContents( catArray ),
				getTemplate( template )
			).then(function( ) {
				
				results = [];
				for(var arg in arguments){
				   	results.push(arguments[arg]);
				}
				var myTemplate = results[1][0].toString();//Make sure we have a string to avoid frag errors
				var myPostUrls = results[0];

				//Get our post data from the returned strings
			    getPostData( myPostUrls ).then(function( data ){
			    	var postContainer = parseMd(data);//returns data array of posts

			    	if(postContainer.length < limit){
			    		var numToShow = postContainer.length-1;
			    	} else {
			    		var numToShow = limit-1
			    	}

					for( var i = 0; i <= numToShow; i ++){
						
						if(postContainer[i] === undefined){
							//Do nothing
						} else {
							
							//Setup our baseUrl
							postContainer[i]['baseUrl'] = myPostUrls[i];
							
							//Adjust our images to point to the correct location
							for( var key in postContainer[i]){
								
								if(key === 'image' ){
									var imgHolder = postContainer[i][key];
									postContainer[i][key] = myPostUrls[i] + imgHolder;
								}
							}

							var completeTemplate = interpolate(myTemplate)(postContainer[i]);
							$(completeTemplate).insertAfter(parentEl);
							updateDOM();
						}
					}

					//Remove parentEl to clean up html
					setTimeout(function(){ parentEl.replaceWith(""); },500);
			    });
			},
			function( err ) {
			  alert( "@ERROR - ", err );
			});
		});	
	};//End buildLists




function togglePost(){
	$('#body').fadeToggle('slow');
	$('#post').fadeToggle('slow');

}




/*-----------------------------------
	Helper Functions



-------------------------------------*/
//To replace brackets with string
//http://stackoverflow.com/questions/15502629/regex-for-mustache-style-double-braces/15502875
/*
	- recursive 
	- pass the string like:
		myString = "<h1>{title}</h1>";
		myObject = {title: 'Hello World'};
		var returnedString = interpolate(myString)(myObject)
*/
function interpolate(str) {
    return function interpolate(o) {
        return str.replace(/{([^{}]*)}/g, function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        });
    }
}


//Get started:
buildTemplates();


/*----------------------------------
Direct User DOM Manipulation
- Once we load all templates and lists
we will call this:
-------------------------------------*/


function updateDOM(){

$('a').unbind('click'); //clear all click events so we don't fire multiple times

//Then attach a click event to each anchor tag
$('a').click(function(evt){
	evt.preventDefault();
	evt.stopPropagation();

	anchorEl = $(this);
	var postUrl = anchorEl.attr('href');

	if(postUrl === "/"){
		window.location.hash = postUrl;
		togglePost();
		return;
	}

	var template = $('post').attr('template');
	
	
	$.when(
	 	getPostData([postUrl]),//must pass an array to deferred(so we don't have to setup 2 different functions to do the same thing for multiple posts)
		getTemplate(template)
	).then(function(results){

		var myTemplate = arguments[1][0].toString();//Make sure we have a string to avoid frag errors
		var myPostData = arguments[0][0];
		var postContainer = parseMd([myPostData]);//must pass array

		var completeTemplate = interpolate(myTemplate)(postContainer[0]);
		$('post').empty();//clear all child nodes from post
		$(completeTemplate).appendTo($('post'));
		updateDOM();

		togglePost();

		//And lastly change our url
		window.location.hash = postUrl;
	});

});


};//End updateDOM











};//End simple blog
jrSimpleBlog();









});//End ready






