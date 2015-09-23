//
// パズル固有スクリプト部 コンビブロック版 cbblock.js v3.4.1
//
pzpr.classmgr.makeCustom(['cbblock'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				this.inputborder();
			}
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Border:{
	ques : 1,

	enableLineNG : true,

	// 線を引かせたくないので上書き
	isLineNG : function(){ return (this.ques===1);},

	isGround : function(){ return (this.ques>0);}
},

Board:{
	qcols : 8,
	qrows : 8,

	hascross  : 1,
	hasborder : 1,

	initialize : function(){
		this.common.initialize.call(this);

		this.tiles  = this.addInfoList(this.klass.AreaTileManager);
		this.blocks = this.addInfoList(this.klass.AreaBlockManager);
	},

	getBlockInfo : function(){
		var tinfo = this.tiles.getAreaInfo();
		var cinfo = this.blocks.getAreaInfo();

		for(var r=1;r<=cinfo.max;r++){
			var d=[], cnt=0, clist=cinfo.area[r].clist;
			cinfo.area[r].size = clist.length;

			for(var i=1;i<=tinfo.max;i++){ d[i]=0;}
			for(var i=0;i<clist.length;i++){
				d[ tinfo.getRoomID(clist[i]) ]++;
			}
			for(var i=1;i<=tinfo.max;i++){ if(d[i]>0){ cnt++;}}
			cinfo.area[r].dotcnt = cnt;
		}
		return cinfo;
	}
},

"AreaTileManager:AreaManager":{
	enabled : true,
	relation : ['border'],
	bdfunc : function(border){ return !border.isGround();}
},
"AreaBlockManager:AreaManager":{
	enabled : true,
	relation : ['border'],
	bdfunc : function(border){ return border.qans>0;}
},

CellList:{
	getBlockShapes : function(){
		if(!!this.shape){ return this.shape;}
		
		var bd=this.board;
		var d=this.getRectSize();
		var data=[[],[],[],[],[],[],[],[]];
		var shapes={cols:d.cols, rows:d.rows, data:[]};

		for(var by=0;by<2*d.rows;by+=2){
			for(var bx=0;bx<2*d.cols;bx+=2){
				data[0].push(this.include(bd.getc(d.x1+bx,d.y1+by))?1:0);
				data[1].push(this.include(bd.getc(d.x1+bx,d.y2-by))?1:0);
			}
		}
		for(var bx=0;bx<2*d.cols;bx+=2){
			for(var by=0;by<2*d.rows;by+=2){
				data[4].push(this.include(bd.getc(d.x1+bx,d.y1+by))?1:0);
				data[5].push(this.include(bd.getc(d.x1+bx,d.y2-by))?1:0);
			}
		}
		data[2]=data[1].concat().reverse(); data[3]=data[0].concat().reverse();
		data[6]=data[5].concat().reverse(); data[7]=data[4].concat().reverse();
		for(var i=0;i<8;i++){ shapes.data[i]=data[i].join('');}
		return (this.shape = shapes);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	borderQuescolor : "white",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawBorderQsubs();

		this.drawBaseMarks();

		this.drawChassis();

		this.drawPekes();
	},

	// オーバーライド
	getBorderColor : function(border){
		if(border.ques===1){
			var cell2=border.sidecell[1];
			return ((cell2.isnull || cell2.error===0) ? this.borderQuescolor : this.errbcolor1);
		}
		else if(border.qans===1){
			return this.borderQanscolor;
		}
		return null;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeCBBlock();
	},
	encodePzpr : function(type){
		this.encodeCBBlock();
	},

	decodeCBBlock : function(){
		var bstr = this.outbstr, bd = this.board, twi=[16,8,4,2,1];
		var pos = (bstr?Math.min((((bd.bdmax+4)/5)|0),bstr.length):0), id=0;
		for(var i=0;i<pos;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(id<bd.bdmax){
					bd.border[id].ques = (ca&twi[w]?1:0);
					id++;
				}
			}
		}
		this.outbstr = bstr.substr(pos);
	},
	encodeCBBlock : function(){
		var num=0, pass=0, cm="", bd = this.board, twi=[16,8,4,2,1];
		for(var id=0,max=bd.bdmax;id<max;id++){
			if(bd.border[id].isGround()){ pass+=twi[num];} num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}
		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeBorder( function(border,ca){
			if     (ca==="3" ){ border.ques = 0; border.qans = 1; border.qsub = 1;}
			else if(ca==="1" ){ border.ques = 0; border.qans = 1;}
			else if(ca==="-1"){ border.ques = 1; border.qsub = 1;}
			else if(ca==="-2"){ border.ques = 0; border.qsub = 1;}
			else if(ca==="2" ){ border.ques = 0;}
			else              { border.ques = 1;}
		});
	},
	encodeData : function(){
		this.encodeBorder( function(border){
			if     (border.qans===1 && border.qsub===1){ return "3 ";}
			else if(border.qans===1){ return "1 ";}
			else if(border.ques===1 && border.qsub===1){ return "-1 ";}
			else if(border.ques===0 && border.qsub===1){ return "-2 ";}
			else if(border.ques===0){ return "2 ";}
			else                    { return "0 ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkSingleBlock",
		"checkBlockNotRect",
		"checkDifferentShapeBlock",
		"checkLargeBlock"
	],

	getCombiBlockInfo : function(){
		/* 境界線で作られる領域の情報 */
		return (this._info.cbinfo = this._info.cbinfo || this.board.getBlockInfo());
	},

	checkBlockNotRect : function(){
		this.checkAllArea(this.getCombiBlockInfo(), function(w,h,a,n){ return (w*h!==a);}, "bkRect");
	},

	checkSingleBlock : function(){ this.checkMiniBlockCount(1, "bkSubLt2");},
	checkLargeBlock  : function(){ this.checkMiniBlockCount(3, "bkSubGt2");},
	checkMiniBlockCount : function(flag, code){
		var cinfo = this.getCombiBlockInfo();
		for(var r=1;r<=cinfo.max;r++){
			var cnt=cinfo.area[r].dotcnt;
			if((flag===1&&cnt>1) || (flag===3&&cnt<=2)){ continue;}
			
			this.failcode.add(code);
			if(this.checkOnly){ break;}
			cinfo.area[r].clist.seterr(1);
		}
	},

	checkDifferentShapeBlock : function(){
		var cinfo = this.getCombiBlockInfo();
		var sides = cinfo.getSideAreaInfo();
		allloop:
		for(var r=1;r<=cinfo.max-1;r++){
			var area1 = cinfo.area[r];
			if(area1.dotcnt!==2){ continue;}
			for(var i=0;i<sides[r].length;i++){
				var s = sides[r][i], area2 = cinfo.area[s];
				if(this.isDifferentShapeBlock(area1, area2)){ continue;}
				
				this.failcode.add("bsSameShape");
				if(this.checkOnly){ break allloop;}
				area1.clist.seterr(1);
				area2.clist.seterr(1);
			}
		}
	},
	isDifferentShapeBlock : function(area1, area2){
		if(area1.dotcnt!==2 || area2.dotcnt!==2 || area1.size!==area2.size){ return true;}
		var s1 = area1.clist.getBlockShapes(), s2 = area2.clist.getBlockShapes();
		var t1=((s1.cols===s2.cols && s1.rows===s2.rows)?0:4);
		var t2=((s1.cols===s2.rows && s1.rows===s2.cols)?8:4);
		for(var t=t1;t<t2;t++){ if(s2.data[0]===s1.data[t]){ return false;}}
		return true;
	}
},

FailCode:{
	bkRect : ["ブロックが四角形になっています。","A block is rectangle."],
	bsSameShape : ["同じ形のブロックが接しています。","The blocks that has the same shape are adjacent."],
	bkSubLt2 : ["ブロックが1つの点線からなる領域で構成されています。","A block has one area framed by dotted line."],
	bkSubGt2 : ["ブロックが3つ以上の点線からなる領域で構成されています。","A block has three or more areas framed by dotted line."]
}
});
