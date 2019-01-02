
function getHTML(url, callback){
    var html = ""
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onload = function(){
        if (xhr.status == 200) {
            callback(null, xhr.responseText);

        } else {
            callback(xhr.statusText);
        }
    };
    xhr.send();
}
function getDownloadUrl(url){
    getHTML(url, function(err, response){
        if (err) {
            console.log('Error: ' + err);
    
        } else {
            var htmlObject = document.createElement('div');
            htmlObject.innerHTML = response;
            var _scriptObject = htmlObject.getElementsByTagName("script")[4]
            var _scriptSTR = _scriptObject.innerText.match(/W.iframeInit\W+.+/g)
            _scriptSTR = _scriptSTR[0].slice(13)
            _scriptSTR = _scriptSTR.slice(0, _scriptSTR.length-6)
            _scriptJSON = JSON.parse(_scriptSTR)
            console.log(_scriptJSON)

        } 
    })
}

chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getVideos") {
        var videoObjects = request.source
        var vElem = document.querySelector("#videos")
        var vObjElem = ""
        if (videoObjects.length){
            for (vidObj of videoObjects){
                var url = getDownloadUrl(vidObj["@id"])
                vObjElem +=`
                <div class="card mb-2">
                    <div class="card-body row">
                        <div class="col-3">
                        <a href="${vidObj["@id"]}" rel="noopener" target="_blank">
                            <img src="${vidObj.thumbnailUrl}" width="80"/>
                        </a>
                        </div>
                        <div class="col-9">
                        <a href="${vidObj["@id"]}" rel="noopener" target="_blank">
                            <h4 class="card-title">${vidObj.name}</h4>
                        </a>
                        </div>
                    </div>
                </div>
                `
            }
        }
        else {
            vObjElem = "<h1>No videos found</h1>"
        }
        
        vElem.innerHTML = vObjElem
        
    }
  });
  
function showError() {
	const HIDE_TIMEOUT = 3000;
	
	if (chrome.runtime.lastError) {
		let errorElem = document.querySelector('.error');

		errorElem.textContent = chrome.runtime.lastError.message;
		errorElem.classList.remove('hidden');

		setTimeout(function () {	
			errorElem.textContent = '';
			errorElem.classList.add('hidden');
		}, HIDE_TIMEOUT);
	}
	return chrome.runtime.lastError;
}



function onWindowLoad() {
    const code = `
    function isHTMLElement(o) {
        return o instanceof Node;
    }
    
    var applicationScriptJSON = document.querySelectorAll('script[type="application/ld+json"]')
    var _videoObject = []
    if (applicationScriptJSON.length){
        for(var asj in applicationScriptJSON){
            _script = applicationScriptJSON[asj]
            if (isHTMLElement(_script)){
                _scriptJSON = JSON.parse(_script.textContent)
                if (_scriptJSON["@type"]==="VideoObject"){
                _videoObject.push(_scriptJSON)
                }
            }
    
        }
    }else{
        console.log("No videos found")
    
    }
    chrome.runtime.sendMessage({
        action: "getVideos",
        source: _videoObject
    });
    `
    chrome.tabs.executeScript({code}, showError);
  
  }
  
  window.onload = onWindowLoad;