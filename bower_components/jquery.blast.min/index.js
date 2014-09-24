/*!
* Blast.js: Blast text apart to make it manipulable.
* @version 0.1.1
* @docs julian.com/research/blast
* @license Copyright 2014 Julian Shapiro. MIT License: http://en.wikipedia.org/wiki/MIT_License
*/
!function($,e,t,n){function a(e){return e=e.replace(g.abbreviations,function(e){return e.replace(/\./g,"{{46}}")}),e=e.replace(g.innerWordPeriod,function(e){return e.replace(/\./g,"{{46}}")})}function i(e){return e.replace(/{{(\d{1,3})}}/g,function(e,t){return String.fromCharCode(t)})}function r(e,n){var a=t.createElement(n.tag);if(a.className=c,n.customClass&&(a.className+=" "+n.customClass,n.generateIndexID&&(a.id=n.customClass+"-"+h.blastedCount)),n.generateValueClass===!0&&("character"===n.delimiter||"word"===n.delimiter)){var i,r=e.data;"word"===n.delimiter&&g.onlyContainsPunctuation.test(r)&&(r=r.replace(g.adjoinedPunctuation,"")),i=c+"-"+n.delimiter+"-"+r.toLowerCase(),a.className+=" "+i}return a.appendChild(e.cloneNode(!1)),a}function s(e,t){var n=-1,l=0;if(3===e.nodeType&&e.data.length){if(h.nodeBeginning&&(e.data="sentence"===t.delimiter?a(e.data):i(e.data),h.nodeBeginning=!1),n=e.data.search(h.delimiterRegex),-1!==n){var d=e.data.match(h.delimiterRegex),o=d[0],c=d[1]||!1;h.blastedCount++,""===o?n++:c&&c!==o&&(n+=o.indexOf(c),o=c);var u=e.splitText(n);u.splitText(o.length),l=1,"sentence"===t.delimiter&&(u.data=i(u.data));var f=r(u,t,h.blastedCount);u.parentNode.replaceChild(f,u),m.generatedElements.push(f)}}else if(1===e.nodeType&&e.hasChildNodes()&&!g.skippedElements.test(e.tagName)&&!g.hasPluginClass.test(e.className))for(var p=0;p<e.childNodes.length;p++)h.nodeBeginning=!0,p+=s(e.childNodes[p],t);return l}function l(e,t){t.debug&&o.time("blast reversal");var n=!1;e.removeClass(c+"-root").removeData(c).find("."+c).each(function(){var e=$(this);if(e.closest("."+c+"-root").length)n=!0;else{var t=this.parentNode;7>=d&&t.firstChild.nodeName,t.replaceChild(this.firstChild,this),t.normalize()}}),t.debug&&(o.log(c+": Reversed Blast"+(e.attr("id")?" on #"+e.attr("id")+".":".")+(n?" Skipped reversal on the children of one or more descendant root elements.":"")),o.timeEnd("blast reversal"))}var d=function(){if(t.documentMode)return t.documentMode;for(var e=7;e>0;e--){var a=t.createElement("div");if(a.innerHTML="<!--[if IE "+e+"]><span></span><![endif]-->",a.getElementsByTagName("span").length)return a=null,e;a=null}return n}(),o=e.console||{log:function(){}},c="blast",u={latinPunctuation:"–—′’'“″„\"(«.…¡¿′’'”″“\")».…!?",latinLetters:"\\u0041-\\u005A\\u0061-\\u007A\\u00C0-\\u017F\\u0100-\\u01FF\\u0180-\\u027F"},g={abbreviations:new RegExp("[^"+u.latinLetters+"](e\\.g\\.)|(i\\.e\\.)|(mr\\.)|(mrs\\.)|(ms\\.)|(dr\\.)|(prof\\.)|(esq\\.)|(sr\\.)|(jr\\.)[^"+u.latinLetters+"]","ig"),innerWordPeriod:new RegExp("["+u.latinLetters+"].["+u.latinLetters+"]","ig"),onlyContainsPunctuation:new RegExp("[^"+u.latinPunctuation+"]"),adjoinedPunctuation:new RegExp("^["+u.latinPunctuation+"]+|["+u.latinPunctuation+"]+$","g"),skippedElements:/(script|style|select|textarea)/i,hasPluginClass:new RegExp("(^| )"+c+"( |$)","gi")},m={generatedElements:[]},h={};$.fn.blast=function(e){var a=$.extend({},$.fn[c].defaults,e);return this.each(function(){var i=$(this);if(e!==!1){h={delimiterRegex:null,blastedCount:0,nodeBeginning:!1},i.data(c)===n||"search"===i.data(c).delimiter&&a.search||(l(i,a),a.debug&&o.log(c+": Removing element's existing Blast call and re-running.")),i.data(c,{delimiter:a.search?"search":a.delimiter}),m.generatedElements=[];try{t.createElement(a.tag)}catch(r){a.tag="span",a.debug&&o.log(c+": Invalid tag supplied. Defaulting to span.")}if(i.addClass(c+"-root"),a.debug&&o.time("blast"),a.search===!0&&"string"===$.type(a.delimiter)&&$.trim(a.delimiter).length)a.delimiter=a.delimiter.replace(/[-[\]{,}(.)*+?|^$\\\/]/g,"\\$&"),h.delimiterRegex=new RegExp("(?:[^-"+u.latinLetters+"])("+a.delimiter+"('s)?)(?![-"+u.latinLetters+"])","i");else switch("string"===$.type(a.delimiter)&&(a.delimiter=a.delimiter.toLowerCase()),a.delimiter){case"letter":case"char":case"character":h.delimiterRegex=/(\S)/;break;case"word":h.delimiterRegex=/\s*(\S+)\s*/;break;case"sentence":h.delimiterRegex=/(?=\S)(([.]{2,})?[^!?]+?([.…!?]+|(?=\s+$)|$)(\s*[′’'”″“")»]+)*)/;break;case"element":h.delimiterRegex=/(?=\S)([\S\s]*\S)/;break;default:if(!(a.delimiter instanceof RegExp))return o.log(c+": Unrecognized delimiter, empty search string, or invalid custom RegEx. Aborting."),i.blast(!1),!0;h.delimiterRegex=a.delimiter}a.stripHTMLTags&&i.html(i.text()),s(this,a)}else e===!1&&i.data(c)&&l(i,a);a.debug&&(o.timeEnd("blast"),i.find(".blast").each(function(){o.log(c+" ["+a.delimiter+"] "+$(this)[0].outerHTML)}).filter(":even").css("backgroundColor","#f12185").end().filter(":odd").css("backgroundColor","#075d9a"))}),e!==!1&&a.returnGenerated===!0?this.pushStack(m.generatedElements):this}}(jQuery,window,document),$.fn.blast.defaults={returnGenerated:!0,delimiter:"word",tag:"span",search:!1,customClass:"",generateIndexID:!1,generateValueClass:!1,stripHTMLTags:!1,debug:!1};