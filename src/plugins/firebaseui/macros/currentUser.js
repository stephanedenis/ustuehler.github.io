/*\
title: $:/plugins/ustuehler/muuri/macros/grid-item-class.js
type: application/javascript
module-type: macro
tags: $:/tags/Macro

Macro to generate a list of CSS classes for the curren tiddler view

\*/
(function(){"use strict";exports.name="grid-item-class";exports.params=[{name:"default",default:"grid-item-content"}];exports.run=function(e){var r=this.wiki.getTiddler(this.getVariable("currentTiddler"));var i=e;if(!r){return i}var t=r.fields["view-class"];if(t){i+=" "+t}var a=r.fields["span"];if(a){i+=" span-"+a}return i}})();