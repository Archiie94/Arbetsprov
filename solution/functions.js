// Global functions to store values.
var previousSearchWords = [];
var searchWord = '';
var isSearching = null;
var previewWordList = document.getElementById("word-list");
var preloader = document.getElementById("search-loader");
var previousSearches = document.getElementById("previous-searches");
var searchBar = document.getElementById('search-bar'); 
var hasSelectedWord = false;
var _api = 'https://api.openbrewerydb.org/breweries/search?page=1&per_page=5&query=';

// Focus on search bar to avoid
// to minimize user-clicks.
searchBar.focus();


/*  searchChange(event) : void
*   Replaces search word on keyup and change the global
*   variable searchWord, which then is used to search for item.
*   We are also checking for clicks on KeyCode 13, which is the enter key
*   if it is pressed, then add the search word.
*/
function searchChange(event){
    // Get the search value form the document.
    searchWord = document.getElementById('search-bar').value;

    // If search equals to empty string then do nothing.
    if ( searchWord.length === 0 && !searchWord ) {
        // Remove found items.
        previewWordList.innerHTML = '';
        return;
    }

    // If Enter is pressed.
    if ( event.keyCode === 13 ){
        onEnter();
        return;
    }

    // If not enter, and string length > 0, fetch results.
    getSearch();
}


/*  getSearch()
*   Searches for the word, and fetches it from the API async,
*   then the callback is sent to presentResult(data).
*/
function getSearch(){
    console.log('searching for... ', searchWord);

    // We have a current thread running? If yes -> don't fetch again
    // but wait for the other query to finish.
    if ( isSearching === null ){

        // Show preloader
        preloader.style.display = "block";

        // Wait 300 sec in-case another char was added.
        setTimeout(() => {
            // Call our callback function to present the result.
            isSearching = httpGetAsync(_api + searchWord, presentResult);
        }, 300);
    }
}



/*  presentResult(data) : void
*   Presents the found data on the screen.
*/
function presentResult(data){
    // Hide preloader.
    preloader.style.display = "none";
                
    // Parse JSON
    data = JSON.parse(data);

    // Fetch 5 first items found
    var _data = data.slice(0, 5);
    isSearching = null;


    var appender = '';
    _data.forEach(element => {
        // \`${ element.name }\` : used to be able to use both double and single quotations in string.
        appender += `<div class='item' onclick="selectSearchItem(\`${ element.name }\`)">${ element.name }</div>`;
    });

    // Create the word list.
    previewWordList.innerHTML = appender; 
}



/*  formatDate(d) : formatedDate (String)
*   Returns the formated date in requested format.
*/
function formatDate(d){
    // Plus one because months goes from 0-11
    var _unformatedMonth = d.getMonth() + 1;
    // If month less than 10, add a 0 before. so it becomes 09 instead of 9.
    var month = ( _unformatedMonth < 10 ? `0${_unformatedMonth}` : _unformatedMonth );
    // Return the formated date.
    return `${d.getFullYear()}-${ month }-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
}


/*  selectSearchItem(item) : void
*   Set the value to selected item.
*   Focus on the searchbar once again.
*/
function selectSearchItem(item){
    // Set current selected item to what was selected
    searchBar.value = item;
    // Re-focus on the input for good UI.
    searchBar.focus();
}


/*  onEnter() : void
*   If user chooses to add a new search result,
*   add it to the list and update the search history.
*/
function onEnter () {
    var _date = new Date();
    _date = formatDate(_date);

    var _selected = {
        name: searchWord,
        date: _date
    }

    // Reset param
    hasSelectedWord = false;
   
    previousSearchWords.push(_selected);
    updateSearchHistory();
}


/*  updateSearchHistory() : void
*   Updates the search history.
*/
function updateSearchHistory(){
    previewWordList.innerHTML = '';
    var appender = '';

    if ( previousSearchWords.length === 0 ){
        previousSearches.style.display = 'none';
        return;
    }

    previousSearchWords.forEach(element => {
        appender += `
            <li>
                <div class="word">
                    ${element.name}
                </div>
                <div class="date">
                    <small>
                        ${element.date}
                    </small>
                </div>
                <div class="action" onclick="removeFromHistory(\`${ element.name }\`)">
                    <i class="material-icons middle">close</i>
                </div>
                <div class="clearfix"></div>
            </li>
        `;
    });
    previousSearches.style.display = 'block';
    previousSearches.innerHTML = appender;
    searchBar.value = '';
}


/*  updateSearch(val) : void
*   Adds searched value to list.
*/
function updateSearch(val){
    // Create obj of serach.
    var _data = {
        word: val,
        date: new Date(),
    };
    // Add object to array.
    previousSearchWords.push(_data);
}


/*  removeFromHistory(val) : void
*   Removes searched value from history.
*/
function removeFromHistory(val){
    // Loop through and remove the occurences.
    for ( var i = 0; i < previousSearchWords.length; i++ ){
        if ( previousSearchWords[i].name === val ){
            previousSearchWords.splice(i, 1);
            i--;
        }
    }
    // Update history after the changes.
    updateSearchHistory();
}


/*  httpGetAsync(url, cb)
*   Send the callback to the given function.
*/
function httpGetAsync(url, cb){
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            cb(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}