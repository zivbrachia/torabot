var WikiquoteApi = (function () {

    var wqa = {};

    //var API_URL = "http://en.wikiquote.org/w/api.php";
    API_URL = "https://he.wikisource.org/w/api.php";
    /**
     * Query based on "titles" parameter and return page id.
     * If multiple page ids are returned, choose the first one.
     * Query includes "redirects" option to automatically traverse redirects.
     * All words will be capitalized as this generally yields more consistent results.
     */
    wqa.queryTitles = function (titles, success, error) {
        $.ajax({
            url: API_URL,
            dataType: "jsonp",
            data: {
                format: "json",
                action: "query",
                redirects: "",
                titles: titles
            },
            
            success: function (result, status) {
                var pages = result.query.pages;
                var pageId = -1;
                for (var p in pages) {
                    var page = pages[p];
                    // api can return invalid recrods, these are marked as "missing"
                    if (!("missing" in page)) {
                        pageId = page.pageid;
                        break;
                    }
                }
                if (pageId > 0) {
                    success(pageId);
                } else {
                    error("No results");
                }
            },

            error: function (xhr, result, status) {
                error("Error processing your query");
            }
        });
    };

    /**
     * Get the sections for a given page.
     * This makes parsing for quotes more manageable.
     * Returns an array of all "1.x" sections as these usually contain the quotes.
     * If no 1.x sections exists, returns section 1. Returns the titles that were used
     * in case there is a redirect.
     */
    wqa.getSectionsForPage = function (pageId, success, error) {
        $.ajax({
            url: API_URL,
            dataType: "jsonp",
            data: {
                format: "json",
                action: "parse",
               prop: "text",
                pageid: pageId,
            },

            success: function (result, status) {
                var text = result.parse.text["*"];
                // var $lis = $(text " .mw-content-rtl p").find('div').attr("class", "mw-content-rtl");
         //       var $lis = $(text.children).find("p");



       /*       var $lis = $(text).find('span');

               $lis.each(function () {
                
                  // if ($(this).text().indexOf("במרחב הביאור של ויקיטקסט") >= 0) $(this).remove();
                   // Remove all children that aren't <small>
                   $(this).children().remove(':not(small)');
                   var $smalls = $(this).find('small');

                   if ($smalls.length > 0) {
                       $smalls.children().remove(':not(small)');
                   } 
               });
               //$lis.find('span').eq(0).remove();
             //  $(this).find('span:first').remove();
             */
                var myMap = new Map();
                var chars = [];
                var strings = [];
                var temp = "";
                var prev = "";

                var fun = function (tag) {
                    if (jQuery.isEmptyObject($(tag))) return;
                    $(tag).children().each(function (index, element) {
                        if ($(this).is("a")) {
                            if ($(this).text().length < 4) {
                                if (prev != "") {
                                    myMap.set(prev, temp); temp = "";
                                } prev = $(this).text();
                            }
                        }
                        else if ($(this).is("small")) { temp = temp + "[" + $(this).text() + "] "; }
                        else {
                            temp = temp + $(this).clone().children().remove().end().text(); + " ";

                            fun(this);
                        }
                    }

)
                };
              //  fun($(text).find("div ~ p ,dd").contents());

                $(text).find("div ~ p ,dd").contents().each(function (index, element) {
            /*        if ($(this).is("a")) { if ($(this).text().length < 4) { if (prev != "") 
                        myMap.set(prev,temp); prev = $(this).text();  }}

                    else {
                        if ($(this).is("a"));
                        else if ($(this).is("small")) { temp = temp +"("+ $(this).text() + ") "; }
                        else temp = temp + $(this).text() + " ";
                    }
    
*/                     //   if ($(this).is("not a")) temp= temp + $(this).text() + " ";
                    if ($(this).is("a"));
                    else if ($(this).is("small")) { temp = temp + "[" + $(this).text() + "] "; }
                    else temp = temp + $(this).clone().children().remove().end().text(); + " ";
                    fun(this);
              /*      $(this).children().each(function (index, element) {
                        if ($(this).is("a")) {
                            if ($(this).text().length < 4) {
                                if (prev != ""){
                                    myMap.set(prev, temp); temp = "";} prev = $(this).text();
                            }
                        }

                        else {
                            if ($(this).is("a"));
                            else if ($(this).is("small")) { temp = temp + "(" + $(this).text() + ") "; }
                            else temp = temp + $(this).text() + " ";
                        }

            
                    })*/
                });

                success(myMap);

             /*   var sectionArray = [];
                var sections = result.parse.sections;
                for (var s in sections) {
                    var splitNum = sections[s].number.split('.');
                    if (splitNum.length > 1 && splitNum[0] === "1") {
                        sectionArray.push(sections[s].index);
                    }
                }
                // Use section 1 if there are no "1.x" sections
                if (sectionArray.length === 0) {
                    sectionArray.push("1");
                }
                success({ titles: result.parse.title, sections: sectionArray });
           */ },
            error: function (xhr, result, status) {
                error("Error getting sections");
            }
        });
    };

    /**
     * Get all quotes for a given section.  Most sections will be of the format:
     * <h3> title </h3>
     * <ul>
     *   <li> 
     *     Quote text
     *     <ul>
     *       <li> additional info on the quote </li>
     *     </ul>
     *   </li>
     * <ul>
     * <ul> next quote etc... </ul>
     *
     * The quote may or may not contain sections inside <b /> tags.
     *
     * For quotes with bold sections, only the bold part is returned for brevity
     * (usually the bold part is more well known).
     * Otherwise the entire text is returned.  Returns the titles that were used
     * in case there is a redirect.
     */
    wqa.getQuotesForSection = function (pageId, sectionIndex, success, error) {
        $.ajax({
            url: API_URL,
            dataType: "jsonp",
            data: {
                format: "json",
                action: "parse",
                noimages: "",
                pageid: pageId,
                section: sectionIndex
            },

            success: function (result, status) {
                var quotes = result.parse.text["*"];
                var quoteArray = []

                // Find top level <li> only
                var $lis = $(quotes).find('li:not(li li)');
                $lis.each(function () {
                    // Remove all children that aren't <b>
                    $(this).children().remove(':not(b)');
                    var $bolds = $(this).find('b');

                    // If the section has bold text, use it.  Otherwise pull the plain text.
                    if ($bolds.length > 0) {
                        quoteArray.push($bolds.html());
                    } else {
                        quoteArray.push($(this).html());
                    }
                });
                success({ titles: result.parse.title, quotes: quoteArray });
            },
            error: function (xhr, result, status) {
                error("Error getting quotes");
            }
        });
    };

    /**
     * Get Wikipedia page for specific section
     * Usually section 0 includes personal Wikipedia page link
     */
    wqa.getWikiForSection = function (title, pageId, sec, success, error) {
        $.ajax({
            url: API_URL,
            dataType: "jsonp",
            data: {
                format: "json",
                action: "parse",
                noimages: "",
                pageid: pageId,
                section: sec
            },

            success: function (result, status) {

                var wikilink;
                console.log('what is iwlink:' + result.parse.iwlinks);
                var iwl = result.parse.iwlinks;
                for (var i = 0; i < (iwl).length; i++) {
                    var obj = iwl[i];
                    if ((obj["*"]).indexOf(title) != -1) {
                        wikilink = obj.url;
                    }
                }
                success(wikilink);
            },
            error: function (xhr, result, status) {
                error("Error getting quotes");
            }
        });
    };
    /**
     * Search using opensearch api.  Returns an array of search results.
     */
    wqa.openSearch = function (titles, success, error) {
        $.ajax({
            url: API_URL,
            dataType: "jsonp",
            data: {
                format: "json",
                action: "opensearch",
                namespace: 0,
                suggest: "",
                search: titles
            },

            success: function (result, status) {
                success(result[1]);
            },
            error: function (xhr, result, status) {
                error("Error with opensearch for " + titles);
            }
        });
    };

    /**
     * Get a random quote for the given title search.
     * This function searches for a page id for the given title, chooses a random
     * section from the list of sections for the page, and then chooses a random
     * quote from that section.  Returns the titles that were used in case there
     * is a redirect.
     */
    wqa.getRandomQuote = function (titles, success, error) {

        var errorFunction = function (msg) {
            error(msg);
        };

        var chooseQuote = function (quotes) {
            var randomNum = Math.floor(Math.random() * quotes.quotes.length);
            success({ titles: quotes.titles, quote: quotes.quotes[randomNum] });
        };

        var getQuotes = function (pageId, sections) {
            var randomNum = Math.floor(Math.random() * sections.sections.length);
            wqa.getQuotesForSection(pageId, sections.sections[randomNum], chooseQuote, errorFunction);
        };

        var getSections = function (pageId) {
            wqa.getSectionsForPage(pageId, function (sections) { getQuotes(pageId, sections); }, errorFunction);
        };

        wqa.queryTitles(titles, getSections, errorFunction);
    };

    /**
     * Capitalize the first letter of each word
     */
    wqa.capitalizeString = function (input) {
        var inputArray = input.split(' ');
        var output = [];
        for (s in inputArray) {
            output.push(inputArray[s].charAt(0).toUpperCase() + inputArray[s].slice(1));
        }
        return output.join(' ');
    };

        wqa.bibleTitles = function (titles, success, error) {
        $.ajax({
            url: API_URL,
            dataType: "jsonp",
            data: {
                format: "json",
                action: "query",
                redirects: "",
                titles: titles
            },
            
            success: function (result, status) {
                var pages = result.query.pages;
                var pageId = -1;
                for (var p in pages) {
                    var page = pages[p];
                    // api can return invalid recrods, these are marked as "missing"
                    if (!("missing" in page)) {
                        pageId = page.pageid;
                        break;
                    }
                }
                if (pageId > 0) {

                    wqa.getSectionsForPage(pageId, success,error);
                } else {
                    error("No results");
                }
            },

            error: function (xhr, result, status) {
                error("Error processing your query");
            }
        });
    };

    return wqa;
}());