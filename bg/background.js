function isHTMLElement(o) {
    return o instanceof Node;
}

const applicationScriptJSON = document.querySelectorAll('script[type="application/ld+json"]')
if (applicationScriptJSON.length){
    for(var asj in applicationScriptJSON){
        _script = applicationScriptJSON[asj]
        if (isHTMLElement(_script)){
            _scriptJSON = JSON.parse(_script.textContent)
        }

    }
}else{
    console.log("No videos found")
    _scriptJSON = []

}