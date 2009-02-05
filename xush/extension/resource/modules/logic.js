// ***** BEGIN LICENSE BLOCK *****// ***** BEGIN LICENSE BLOCK *****
// Version: MPL 1.1/GPL 2.0/LGPL 2.1
// 
// The contents of this file are subject to the Mozilla Public License Version
// 1.1 (the "License"); you may not use this file except in compliance with
// the License. You may obtain a copy of the License at
// http://www.mozilla.org/MPL/
// 
// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
// for the specific language governing rights and limitations under the
// License.
// 
// The Original Code is Mozilla Corporation Code.
// 
// The Initial Developer of the Original Code is
// Adam Christian.
// Portions created by the Initial Developer are Copyright (C) 2008
// the Initial Developer. All Rights Reserved.
// 
// Contributor(s):
//  Adam Christian <adam.christian@gmail.com>
// 
// Alternatively, the contents of this file may be used under the terms of
// either the GNU General Public License Version 2 or later (the "GPL"), or
// the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
// in which case the provisions of the GPL or the LGPL are applicable instead
// of those above. If you wish to allow use of your version of this file only
// under the terms of either the GPL or the LGPL, and not to allow others to
// use your version of this file under the terms of the MPL, indicate your
// decision by deleting the provisions above and replace them with the notice
// and other provisions required by the GPL or the LGPL. If you do not delete
// the provisions above, a recipient may use your version of this file under
// the terms of any one of the MPL, the GPL or the LGPL.
// 
// ***** END LICENSE BLOCK *****

var EXPORTED_SYMBOLS = ['okp'];

var elementslib = {}; Components.utils.import('resource://xush/modules/elementslib.js', elementslib);
var controller = {}; Components.utils.import('resource://xush/modules/controller.js', controller);
var strings = {}; Components.utils.import('resource://xush/stdlib/strings.js', strings);

var that = this;

logic = {};
logic.hist = [];
logic.histPos = 0;
//logic.histLength = 20;

logic.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
           .getService(Components.interfaces.nsIWindowMediator);
                  

//making dir also work as a function call
var dir = function(obj){
  for (prop in obj){
     logic.send(prop);
   }
}
//onkeypress events attached to the UI
var okp = function(event){
  that.window = logic.gmr().content;
  that.document = logic.gmr().content.document;
  
  if (window.navigator.platform.indexOf('Mac') != -1){
    if ((event.charCode == 83) && (event.metaKey) && (event.shiftKey)) {
      logic.build(event);
      logic.getWindows();
    }
  }
  else {
    if ((event.charCode == 83) && (event.altKey) && (event.shiftKey) && (event.ctrlKey)) {
      logic.build(event);
      logic.getWindows();
    }
  }
  if ((event.charCode == 83) && (event.ctrlKey) && (event.shiftKey)) {
    logic.build(event);
    logic.getWindows();
  }
  if ((event.keyCode == 13) && (event.shiftKey == false)){
     if (event.target.id == "XUSHInput"){
       event.preventDefault();
       logic.enter(event); 
     }
  }
}    

logic.gmr = function(){
  return this.wm.getMostRecentWindow('navigator:browser');
}
//get a reference to the output console
logic.jout = function(){
  return this.gmr().content.document.getElementById('XUSHOutput');
}
//get a reference to the output console
logic.jin = function(){
  return this.gmr().content.document.getElementById('XUSHInput');
}

logic.jo = function(){
  return this.gmr().content.document.getElementById('XUSHOverlay');
}

logic.sendCmd = function(s){
  this.jout().insertBefore(this.entry('<font color="tan">xush%</font> <font color="white">'+s+'</font>'), this.jout().childNodes[0]);
  //this.jout().insertBefore(this.entry('<br>'), this.jout().childNodes[0]);
}

//send output to console
logic.send = function(s){
  if (s == undefined){
    return;
  }
  this.jout().insertBefore(this.entry('&nbsp;&nbsp;'+s), this.jout().childNodes[0]);
}

logic.getWindows = function(){
   var enumerator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                    .getService(Components.interfaces.nsIWindowMediator)
                    .getEnumerator("");
    var s = "";
    //define an array we can access
    that.windows = [];
    var c = 1;
    while(enumerator.hasMoreElements()) {
      var win = enumerator.getNext();
      that.windows.push(win);
      c++;
    }
}

//logic to handle each of the command inputs
logic.handle = function(cmd){
  
  //if the command has spaces -- args
  var cmdArr = cmd.split(' ');
  
  switch(cmdArr[0]){
  //clear window 
  case 'clear':
    this.jout().innerHTML = "";
    break;
  
  case 'exit':
    this.jo().style.display = "none";
    break
     
  //show me all the windows  
  case 'windows':
    this.getWindows();
    for (win in that.windows){
      this.send( win+'. '+that.windows[win].document.documentElement.getAttribute('windowtype') + ': ' + that.windows[win].title); 
    }
    this.sendCmd(cmd);
    break;
    
  //dir
  case 'dir':
    //if has an arg
    if (cmdArr[1]){
      try {
        var arg = eval(cmdArr[1]);
        for (prop in arg){
          this.send(prop);
        }
      } catch(err){
        this.send('<font color="red">'+err+'</font>');
      }
    }
    else {
      for (prop in that){
        this.send(prop);
      }
    }
    this.sendCmd(cmd);
    break;
    
  //help case
  case 'help':
    var opts = [];
    opts.push('<b>XUSH Help!<b>')
    opts.push('dir -- default shows you the current scope, \'dir obj\' or \'dir(obj)\' will show you the properties of the object.');
    opts.push('window -- reference to current content window.');
    opts.push('windows -- show you all the open in the browser.');
    opts.push('windows[x] -- access the window object of your choice');
    opts.push('elementslib -- bag of fun tricks for doing element lookups in the browser.');
    opts.push('clear -- reset the output.');
    
    while(opts.length != 0){
      this.send(opts.pop());
    }
    this.sendCmd(cmd);
    break;
  
  //defaut is to eval
  default:
     try {
       var res = eval.call(that, cmd);
       if ((cmd.indexOf('=') == -1) && (res == null)){
         this.send(cmd + ' is null.')
       }
       else { this.send(res); }
     }
     catch(err){
       this.send('<font color="red">'+err+'</font>');
       throw err;
     }
     this.sendCmd(cmd);
  }
  
  this.jin().value = "";
  this.jin().focus();
}

//generate a new output entry node
logic.entry = function(val){
  var nd = this.gmr().content.document.createElement('div');
  nd.style.textAlign = "left";
  nd.style.paddingLeft = "20px";
  nd.style.paddingBottom = "1px";
  nd.style.color = "lightblue";
  nd.style.font = "12px arial";
  nd.innerHTML = val;
  return nd;
}

//when the user presses enter
logic.enter = function(event) {
  var inp = this.gmr().content.document.getElementById('XUSHInput');
  inp.value = strings.trim(inp.value);
  //ignore empty returns
  if ((inp.value == "") || (inp.value == " ")){
    return;
  }
  //if we have less than histLength
  //if (this.hist.length < this.histLength){
    this.hist.unshift(inp.value);
    this.histPos = this.hist.length -1;
  // }
  //   else {
  //     this.hist.pop();
  //     this.hist.unshift(inp.value);
  //   }
    //pass input commands to the handler
  this.handle(inp.value);
};

//build the whole ui             
logic.build = function(event) {
  var jo = this.gmr().content.document.getElementById('XUSHOverlay');
  
  //if we can't get ahold of the overlay
  if (!jo){
      var d = this.gmr().content.document.createElement('div');
        d.style.width = "98%";
        d.style.height = "100%";
        d.style.paddingLeft = "20px";
        d.style.position = "absolute";
        d.style.zIndex = "9999";
        d.style.background = "black";
        d.style.top = "0px";
        d.style.left = "0px";
        d.style.opacity = "0.9";
        d.style.filter = "alpha(opacity=90)";
        d.id = "XUSHOverlay";
        d.style.display = "block";
        d.addEventListener("keydown", function(event){ i.focus(); }, false);
                   
      var i = this.gmr().content.document.createElement('textarea');
        //i.size = "50";
        i.id = "XUSHInput";
        i.value = "What's on your mind?";
        i.style.width = "90%";
        i.cols = "32";
        i.rows = "8";
        i.style.left = "0px";
        i.style.top = "2%";
        i.style.left = "20px";
        i.style.position = "absolute";
        i.style.color = "white";
        i.style.background = "black";
        i.style.border = "1px solid #aaa";
        i.style.fontSize = "20px";
        i.addEventListener("keydown", function(event){
          if (event.target.value == "What's on your mind?"){
            event.target.value = "";
          }
          //if there is a command history
          if (logic.hist.length != 0){
            //uparrow
            if ((event.keyCode == 38) && (event.charCode == 0) && (event.shiftKey == true)){
              if (logic.histPos == logic.hist.length -1){
                logic.histPos = 0;
              } else {
                logic.histPos++;
              }
              logic.jin().value = logic.hist[logic.histPos];
            }
            //downarrow
            if ((event.keyCode == 40) && (event.charCode == 0) && (event.shiftKey == true)){
              if (logic.histPos == 0){
                logic.histPos = logic.hist.length -1;
              } else {
               logic.histPos--; 
              }
              logic.jin().value = logic.hist[logic.histPos];
            }
          }
        }, false);
        d.appendChild(i);   
      
      var o = this.gmr().content.document.createElement('div');
        //i.size = "50";
        o.id = "XUSHOutput";
        o.style.width = "90%";
        o.style.height = "80%";
        o.style.left = "0px";
        o.style.top = "15%";
        o.style.left = "20px";
        o.style.position = "absolute";
        o.style.background = "black";
        o.style.border = "1px solid #aaa";
        o.style.fontSize = "20px";
        o.style.overflow = "auto";
        
        o.addEventListener("keydown", function(event){ i.focus(); }, false);
        
      d.appendChild(o);   
      this.gmr().content.document.body.appendChild(d);
      this.gmr().content.document.getElementById('XUSHInput').focus();      
  }
  //toggle it
  else {
    if (jo.style.display == "block"){
      jo.style.display = "none";
    }
    else {
      jo.style.display = "block";
      this.gmr().content.document.getElementById('XUSHInput').focus();
    }
  }
};
