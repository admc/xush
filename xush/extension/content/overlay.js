var logic = {}; Components.utils.import('resource://xush/modules/logic.js', logic);

var XUSH = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
  }
};


window.addEventListener("load", function(e) { XUSH.onLoad(e); }, false);

var enumerator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                  .getService(Components.interfaces.nsIWindowMediator)
                  .getEnumerator("");
while(enumerator.hasMoreElements()) {
  var win = enumerator.getNext();
  win.documentLoaded = true;
  win.addEventListener("keypress", logic.okp, false);
}

//when a new dom window gets opened
var observer = {
 observe: function(subject,topic,data){
   
   subject.addEventListener("load", function(event) {
     subject.documentLoaded = true;
     subject.addEventListener("keypress", logic.okp, false);
   }, false);
 }
};

var observerService =
 Components.classes["@mozilla.org/observer-service;1"]
   .getService(Components.interfaces.nsIObserverService);

observerService.addObserver(observer, "toplevel-window-ready", false);