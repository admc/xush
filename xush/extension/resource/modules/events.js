// ***** BEGIN LICENSE BLOCK *****
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
//  Mikeal Rogers <mikeal.rogers@gmail.com>
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

var EXPORTED_SYMBOLS = ["createEventObject", "triggerEvent", "getKeyCodeFromKeySequence",
                        "triggerKeyEvent", "triggerMouseEvent"];
                        

var createEventObject = function(element, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
  var evt = element.ownerDocument.createEventObject();
  evt.shiftKey = shiftKeyDown;
  evt.metaKey = metaKeyDown;
  evt.altKey = altKeyDown;
  evt.ctrlKey = controlKeyDown;
  return evt;
};


    /* Fire an event in a browser-compatible manner */
var triggerEvent = function(element, eventType, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
  canBubble = (typeof(canBubble) == undefined) ? true: canBubble;
  var evt = document.createEvent('HTMLEvents');

  evt.shiftKey = shiftKeyDown;
  evt.metaKey = metaKeyDown;
  evt.altKey = altKeyDown;
  evt.ctrlKey = controlKeyDown;

  evt.initEvent(eventType, canBubble, true);
  element.dispatchEvent(evt);

};

var getKeyCodeFromKeySequence = function(keySequence) {
  var match = /^\\(\d{1,3})$/.exec(keySequence);
  if (match != null) {
      return match[1];

  }
  match = /^.$/.exec(keySequence);
  if (match != null) {
      return match[0].charCodeAt(0);

  }
  // this is for backward compatibility with existing tests
  // 1 digit ascii codes will break however because they are used for the digit chars
  match = /^\d{2,3}$/.exec(keySequence);
  if (match != null) {
      return match[0];

  }

  // mozmill.results.writeResult("invalid keySequence");
  
}

var triggerKeyEvent = function(element, eventType, keySequence, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {

  var keycode = getKeyCodeFromKeySequence(keySequence);
  canBubble = (typeof(canBubble) == undefined) ? true: canBubble;
  
  var evt;
  if (element.ownerDocument.defaultView.KeyEvent) {
      evt = element.ownerDocument.defaultView.document.createEvent('KeyEvents');
      evt.initKeyEvent(eventType, true, true, element.ownerDocument.defaultView, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown, keycode, keycode);
  } 
  else {
      evt = element.ownerDocument.defaultView.document.createEvent('UIEvents');

      evt.shiftKey = shiftKeyDown;
      evt.metaKey = metaKeyDown;
      evt.altKey = altKeyDown;
      evt.ctrlKey = controlKeyDown;

      evt.initUIEvent(eventType, true, true, element.ownerDocument.defaultView, 1);
      evt.keyCode = keycode;
      evt.which = keycode;

  }
  element.dispatchEvent(evt);
}

    /* Fire a mouse event in a browser-compatible manner */
var triggerMouseEvent = function(element, eventType, canBubble, clientX, clientY, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown) {
  
  clientX = clientX ? clientX: 0;
  clientY = clientY ? clientY: 0;

  //LOG.warn("mozmill.events.triggerMouseEvent assumes setting screenX and screenY to 0 is ok");
  var screenX = 0;
  var screenY = 0;

  canBubble = (typeof(canBubble) == undefined) ? true: canBubble;

  var evt = element.ownerDocument.defaultView.document.createEvent('MouseEvents');
  if (evt.initMouseEvent) {
      //LOG.info("element has initMouseEvent");
      //Safari
      evt.initMouseEvent(eventType, canBubble, true, element.ownerDocument.defaultView, 1, screenX, screenY, clientX, clientY, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown, 0, null)

  }
  else {
      //LOG.warn("element doesn't have initMouseEvent; firing an event which should -- but doesn't -- have other mouse-event related attributes here, as well as controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown");
      evt.initEvent(eventType, canBubble, true);
      evt.shiftKey = shiftKeyDown;
      evt.metaKey = metaKeyDown;
      evt.altKey = altKeyDown;
      evt.ctrlKey = controlKeyDown;

  }
  //Used by safari
  element.dispatchEvent(evt);
}
