// util.js v3.4.0
// jshint node:true

(function(){

var api = pzpr.env.API,
	eventMouseDown = "mousedown",
	eventMouseMove = "mousemove",
	eventMouseUp   = "mouseup";

if(api.pointerevent){
	eventMouseDown = "pointerdown";
	eventMouseMove = "pointermove";
	eventMouseUp   = "pointerup";
}
else if(api.mspointerevent){
	eventMouseDown = "MSPointerDown";
	eventMouseMove = "MSPointerMove";
	eventMouseUp   = "MSPointerUp";
}
else if(api.touchevent){
	eventMouseDown = "touchstart";
	eventMouseMove = "touchmove";
	eventMouseUp   = "touchend";
}

//----------------------------------------------------------------------
// EventやDOM関連のツール的関数群
//----------------------------------------------------------------------
pzpr.util = {
	//---------------------------------------------------------------
	// pzpr.jsが読み込まれているスクリプトのパスを取得する
	getpath : function(){
		if(!pzpr.env.node){
			var srcs=document.getElementsByTagName('script');
			for(var i=0;i<srcs.length;i++){
				var result = srcs[i].src.match(new RegExp("^(.*\\/)"+"pzpr.js$"));
				if(result){ return result[1] + (!result[1].match(/\/$/) ? '/' : '');}
			}
		}
		else{
			return require('path').dirname(__filename) + '/' + (__filename.match('pzpr.js') ? '' : '../');
		}
		return "";
	},

	//---------------------------------------------------------------
	// 現在の時間を取得
	currentTime : function(){ return (new Date()).getTime();},

	//---------------------------------------------------------------
	// Elementの生成関連
	//---------------------------------------------------------------
	unselectable : function(el){
		el.style.MozUserSelect    = 'none';
		el.style.KhtmlUserSelect  = 'none';
		el.style.webkitUserSelect = 'none';
		el.style.msUserSelect     = 'none';
		el.style.userSelect       = 'none';
		el.unselectable = "on";
		return this;
	},

	//----------------------------------------------------------------------
	// pzpr.util.addEvent()          addEventListener()を呼び出す
	//----------------------------------------------------------------------
	addEvent : function(el, type, self, callback, capt){
		if     (type==="mousedown"){ type = eventMouseDown;}
		else if(type==="mousemove"){ type = eventMouseMove;}
		else if(type==="mouseup")  { type = eventMouseUp;}
		
		function executer(e){ callback.call(self, e);}
		el.addEventListener(type, executer, !!capt);
		return executer;
	},

	//---------------------------------------------------------------------------
	// pzpr.util.getMouseButton() 左/中/右ボタンが押されているかチェックする
	//---------------------------------------------------------------------------
	getMouseButton : function(e){
		if(e.touches!==void 0){
			/* touchイベントだった場合 */
			if(e.touches.length>=1){
				return (e.touches.length===1 ? 'left' : 'right');
			}
			return '';
		}
		return ['left','middle','right'][(e.button!==void 0 ? e.button : e.which-1)] || '';
	},

	//----------------------------------------------------------------------
	// pzpr.util.getPagePos() イベントが起こったページ上の座標を返す
	// pzpr.util.pageX()      イベントが起こったページ上のX座標を返す
	// pzpr.util.pageY()      イベントが起こったページ上のY座標を返す
	//----------------------------------------------------------------------
	getPagePos : function(e){
		return {px:this.pageX(e), py:this.pageY(e)};
	},
	pageX : function(e){
		if(e.touches!==void 0 && e.touches.length>0){
			var len=e.touches.length, pos=0;
			if(len>0){
				for(var i=0;i<len;i++){ pos += e.touches[i].pageX;}
				return pos/len;
			}
		}
		return e.pageX || 0;
	},
	pageY : function(e){
		if(e.touches!==void 0 && e.touches.length>0){
			var len=e.touches.length, pos=0;
			if(len>0){
				for(var i=0;i<len;i++){ pos += e.touches[i].pageY;}
				return pos/len;
			}
		}
		return e.pageY || 0;
	},

	//--------------------------------------------------------------------------------
	// pzpr.util.getRect()   エレメントの四辺の座標を返す
	//--------------------------------------------------------------------------------
	getRect : function(el){
		var rect = el.getBoundingClientRect(), scrollLeft, scrollTop;
		if(window.scrollX!==void 0){
			scrollLeft = window.scrollX;
			scrollTop  = window.scrollY;
		}
		else{
			/* IE11以下向け */
			var _html = document.documentElement;
			scrollLeft = _html.scrollLeft;
			scrollTop  = _html.scrollTop;
		}
		var left   = rect.left   + scrollLeft;
		var top    = rect.top    + scrollTop;
		var right  = rect.right  + scrollLeft;
		var bottom = rect.bottom + scrollTop;
		return { top:top, bottom:bottom, left:left, right:right, height:(bottom-top), width:(right-left)};
	},

	//---------------------------------------------------------------------------
	// pzpr.util.checkpid()  メニューなどが表示対象のパズルかどうか返す
	//---------------------------------------------------------------------------
	checkpid : function(str,pid){
		var matches = str.match(/!?[a-z0-9]+/g), isdisp = true;
		if(!!matches){
			isdisp = false;
			for(var i=0;i<matches.length;i++){
				if(matches[i].charAt(0)!=="!"){ if(matches[i]===pid){ isdisp = true;}}
				else                          { isdisp = (matches[i].substr(1)!==pid);}
			}
		}
		return isdisp;
	}
};

})();