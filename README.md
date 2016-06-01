#Simple Blogger


## What is Simple Blogger? 
(tenative name, btw... if you have a better one, please comment)

#### Simple Blogger is a jQuery based, static content generating, website template.
#####It works much similar to any old website with the exception of DOM traversing magnificence!!! It turns your linked URL [so 2001] site into a smooth transitioning content rich masterpiece. All you do is set up your categories folder, plug in a few custom tags and you'll be laughing at frustrated freelance WordPress devs in no time.



####This project is Gary Busey approved
![Gary Busey Approved](https://cdn.meme.am/images/200x200/14841805.jpg)



# DOCS:

So far I just have these, but I am putting together an actual documentation page that will be hosted on the site. Bare with me... 

###Required Items:
- Some knowledge of html/css/javascript and jquery
- this little library requires... the jrSimpleBlogger.js
- It also requires jQuery. (make sure jQuery script runs before blogger script at the BOTTOM OF YOUR INDEX.HTML, right above the closing body tag)
- I used bootstrap for the layouts, you are free to use whatever you chose.


###Categories:
- should start with a "/categories/" folder. View this example for reference. It should all be pretty straight forward.

- Category names and post names should have dashes instead of spaces.

- Structure like so:   root/categories/current-events/our-current-event

- All posts should have an index.md in them: our-current-event/index.md
Read more on the index.md below.


###Templates:
- Your index.html should contain your header, body, footer templates.
- The templates HTML.
- The list templates in the example are repeated for each category post
- The post template is used for all posts (you can tell the post what to use)


CUSTOM TAGS:
    '<template link=""></template>'


...more to come... have to leave

