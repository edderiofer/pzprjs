//
// パズル固有スクリプト部 エルート・さしがね版 loute.js v3.4.1
//
pzpr.classmgr.makeCustom(['loute','sashigane'], {
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
			if(this.mousestart || this.mousemove){ this.inputarrow_cell();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum_loute();}
		}
	},

	inputarrow_cell_main : function(cell, dir){
		cell.setQdir(cell.qdir!==dir?dir:0);
		cell.setQnum(-1);
	},

	inputqnum_loute : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		else{
			this.inputcell_loute(cell);
		}
	},
	inputcell_loute : function(cell){
		var dir = cell.qdir, pid = this.pid;
		if(dir!==5){
			var array = [0,5,1,2,3,4,-2], len = array.length;
			if(this.btn.Left){
				for(var i=0;i<=len-1;i++){
					if(dir===array[i]){
						cell.setQdir(array[((i<len-1)?i+1:0)]);
						break;
					}
				}
			}
			else if(this.btn.Right){
				for(var i=len-1;i>=0;i--){
					if(dir===array[i]){
						cell.setQdir(array[((i>0)?i-1:len-1)]);
						break;
					}
				}
				if(cell.qdir===5 && pid==='sashigane'){ cell.setQnum(cell.getmaxnum());}
			}
		}
		else{
			var qn = cell.getNum(), min, max;
			if(pid==='sashigane'){ max=cell.getmaxnum(); min=cell.getminnum();}
			if(this.btn.Left){
				if(pid==='loute'){ cell.setQdir(1);}
				else if(qn<min){ cell.setNum(min);}
				else if(qn<max){ cell.setNum(qn+1);}
				else           { cell.setNum(-1); cell.setQdir(1);}
			}
			else if(this.btn.Right){
				if(pid==='loute'){ cell.setQdir(0);}
				else if(qn>max){ cell.setNum(max);}
				else if(qn>min){ cell.setNum(qn-1);}
				else if(qn!==-1){ cell.setNum(-1);}
				else            { cell.setQdir(0);}
			}
		}
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		if(ca.match(/shift/)){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(this.key_inputdirec(ca)){ return;}

		if(this.pid==='loute'){
			this.key_arrow_loute(ca);
		}
		else if(this.pid==='sashigane'){
			this.key_inputqnum_sashigane(ca);
		}
	},

	key_arrow_loute : function(ca){
		if     (ca==='1')          { ca='1';}
		else if(ca==='2')          { ca='4';}
		else if(ca==='3')          { ca='2';}
		else if(ca==='4')          { ca='3';}
		else if(ca==='5'||ca==='q'){ ca='q';}
		else if(ca==='6'||ca===' '){ ca=' ';}

		var cell = this.cursor.getc(), val=-1;

		if('1'<=ca && ca<='4'){ val = +ca; val = (cell.qdir!==val?val:0);}
		else if(ca==='-') { val = (cell.qdir!==-2?-2:0);}
		else if(ca==='q') { val = (cell.qdir!==5?5:0);}
		else if(ca===' ') { val = 0;}
		else if(ca==='s1'){ val = -2;}
		else{ return;}

		cell.setQdir(val);
		this.prev = cell;
		cell.draw();
	},

	key_inputqnum_sashigane : function(ca){
		var cell = this.cursor.getc();
		if(ca==='q'){
			cell.setQdir((cell.qdir!==5)?5:0);
			cell.setQnum(-1);
		}
		else if(ca==='-'){
			cell.setQdir((cell.qdir!==-2||cell.qnum!==-1)?-2:0);
			cell.setQnum(-1);
		}
		else if(ca===' '){
			cell.setQdir(0);
			cell.setQnum(-1);
		}
		else{
			this.key_inputqnum_main(cell,ca);
			if(cell.isNum() && cell.qdir!==5){ cell.setQdir(5);}
		}

		this.prev = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : function(){
		var bd=this.board, bx=this.bx, by=this.by;
		var col = (((bx<(bd.maxbx>>1))?(bd.maxbx-bx+2):bx+2)>>1);
		var row = (((by<(bd.maxby>>1))?(bd.maxby-by+2):by+2)>>1);
		return (col+row-1);
	},
	minnum : function(){
		return ((this.board.qcols>=2?2:1)+(this.board.qrows>=2?2:1)-1);
	},

	getObjNum : function(){ return this.qdir;},
	isCircle : function(){ return this.qdir===5;}
},

Board:{
	qcols : 8,
	qrows : 8,

	hasborder : 1,

	getLblockInfo : function(){
		var rinfo = this.getRoomInfo();
		rinfo.place = [];

		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.area[r].clist, d = clist.getRectSize();

			/* 四角形のうち別エリアとなっている部分を調べる */
			/* 幅が1なので座標自体は調べなくてよいはず      */
			var subclist = this.cellinside(d.x1,d.y1,d.x2,d.y2).filter(function(cell){ return (rinfo.getRoomID(cell)!==r);});
			var dl = subclist.getRectSize();
			if( subclist.length===0 || (dl.cols*dl.rows!==dl.cnt) || ((d.cols-1)!==dl.cols) || ((d.rows-1)!==dl.rows) ){
				rinfo.area[r].shape = 0;
				for(var i=0;i<clist.length;i++){ rinfo.place[clist[i].id] = 0;}
			}
			else{
				rinfo.area[r].shape = 1; /* 幅が1のL字型 */
				for(var i=0;i<clist.length;i++){ rinfo.place[clist[i].id] = 1;} /* L字型ブロックのセル */

				/* 端のセル */
				var edge1=null, edge2=null;
				if     ((d.x1===dl.x1&&d.y1===dl.y1)||(d.x2===dl.x2&&d.y2===dl.y2))
							{ edge1 = this.getc(d.x1,d.y2).id; edge2 = this.getc(d.x2,d.y1).id;}
				else if((d.x1===dl.x1&&d.y2===dl.y2)||(d.x2===dl.x2&&d.y1===dl.y1))
							{ edge1 = this.getc(d.x1,d.y1).id; edge2 = this.getc(d.x2,d.y2).id;}
				rinfo.place[edge1] = 2;
				rinfo.place[edge2] = 2;

				/* 角のセル */
				var corner=null;
				if     (d.x1===dl.x1 && d.y1===dl.y1){ corner = this.getc(d.x2,d.y2).id;}
				else if(d.x1===dl.x1 && d.y2===dl.y2){ corner = this.getc(d.x2,d.y1).id;}
				else if(d.x2===dl.x2 && d.y1===dl.y1){ corner = this.getc(d.x1,d.y2).id;}
				else if(d.x2===dl.x2 && d.y2===dl.y2){ corner = this.getc(d.x1,d.y1).id;}
				rinfo.place[corner] = 3;
			}
		}
		
		return rinfo;
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	bordercolor_func : "qans",

	globalfontsizeratio : 0.85,		/* sashigane用 */
	circleratio : [0.40, 0.40],		/* 線幅を1pxにする */

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawCellArrows();
		this.drawCircles();
		this.drawHatenas_loute();
		if(this.pid==='sashigane'){ this.drawNumbers();}

		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	},

	getCircleStrokeColor : function(cell){
		if(cell.isCircle()){ return this.quescolor;}
		return null;
	},
	circlefillcolor_func : "null",

	drawHatenas_loute : function(){
		var g = this.vinc('cell_hatena', 'auto');
		var option = {ratio:(this.pid==='sashigane' ? [0.8] : [0.94])};
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = "cell_text_h_"+cell.id;
			if(cell.qdir===-2){
				g.fillStyle = (cell.error===1 ? this.fontErrcolor : this.fontcolor);
				this.disptext("?", cell.bx*this.bw, cell.by*this.bh, option);
			}
			else{ g.vhide();}
		}
	}
},
"Grahpic@sashigane":{
	hideHatena : true
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@loute":{
	decodePzpr : function(type){
		this.decodeLoute();
	},
	encodePzpr : function(type){
		this.encodeLoute();
	},

	decodeLoute : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							   { cell.qdir = parseInt(ca,16);}
			else if(ca === '.'){ cell.qdir = -2;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-16);}

			c++;
			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeLoute : function(){
		var count=0, cm="", bd = this.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", dir = bd.cell[c].qdir;

			if     (dir===-2){ pstr = ".";}
			else if(dir!== 0){ pstr = dir.toString(16);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	}
},
"Encode@sashigane":{
	decodePzpr : function(type){
		this.decodeSashigane();
	},
	encodePzpr : function(type){
		this.encodeSashigane();
	},

	decodeSashigane : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[c];

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							   { cell.qdir = 5; cell.qnum = parseInt(ca,16);}
			else if(ca === '-'){ cell.qdir = 5; cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca === '.'){ cell.qdir = 5;}
			else if(ca === '%'){ cell.qdir = -2;}
			else if(ca>='g' && ca<='j'){ cell.qdir = (parseInt(ca,20)-15);}
			else if(ca>='k' && ca<='z'){ c+=(parseInt(ca,36)-20);}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeSashigane : function(){
		var cm = "", count = 0, bd = this.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", dir=bd.cell[c].qdir, qn=bd.cell[c].qnum;
			if(dir===5){
				if     (qn>= 0&&qn<  16){ pstr=    qn.toString(16);}
				else if(qn>=16&&qn< 256){ pstr="-"+qn.toString(16);}
				else                    { pstr=".";}
			}
			else if(dir===-2){ pstr="%";}
			else if(dir!==0) { pstr=(dir+15).toString(20);}
			else{ count++;}

			if     (count=== 0){ cm += pstr;}
			else if(pstr || count===16){ cm += ((count+19).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+19).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(cell,ca){
			if(ca.charAt(0)==="o"){
				cell.qdir = 5;
				if(ca.length>1){ cell.qnum = +ca.substr(1);}
			}
			else if(ca==="-"){ cell.qdir = -2;}
			else if(ca!=="."){ cell.qdir = +ca;}
		});

		this.decodeBorderAns();
	},
	encodeData : function(){
		var pid = this.pid;
		this.encodeCell( function(cell){
			if(pid==='sashigane' && cell.qdir===5){
				return "o"+(cell.qnum!==-1?cell.qnum:'')+" ";
			}
			else if(cell.qdir===-2){ return "- ";}
			else if(cell.qdir!== 0){ return cell.qdir+" ";}
			else{ return ". ";}
		});

		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkArrowCorner1",
		"checkArrowCorner2",
		"checkCircleCorner",
		"checkNumberAndSize+@sashigane",
		"checkBorderDeadend",
		"checkLblock"
	],

	getLblockInfo : function(){
		return (this._info.lbinfo = this._info.lbinfo || this.board.getLblockInfo());
	},

	checkArrowCorner1 : function(){
		var rinfo = this.getLblockInfo();
		allloop:
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.area[id].shape===0){ continue;}

			var clist = rinfo.area[id].clist;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], num = cell.getObjNum();
				if(num<1 || num>4 || rinfo.place[cell.id]===2){ continue;}
				
				this.failcode.add("arBlkEdge");
				if(this.checkOnly){ break allloop;}
				clist.seterr(1);
				break;
			}
		}
	},

	checkArrowCorner2 : function(){
		var rinfo = this.getLblockInfo();
		allloop:
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.area[id].shape===0){ continue;}

			var clist = rinfo.area[id].clist;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], adb = cell.adjborder, num = cell.getObjNum();
				if(num<1 || num>4 ||
				  !((num===cell.UP && adb.top.isBorder()   ) ||
					(num===cell.DN && adb.bottom.isBorder()) ||
					(num===cell.LT && adb.left.isBorder()  ) ||
					(num===cell.RT && adb.right.isBorder() ) ) ){ continue;}
				
				this.failcode.add("arNotPtCnr");
				if(this.checkOnly){ break allloop;}
				clist.seterr(1);
				break;
			}
		}
	},

	checkCircleCorner : function(){
		var rinfo = this.getLblockInfo();
		allloop:
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.area[id].shape===0){ continue;}

			var clist = rinfo.area[id].clist;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				if(!cell.isCircle() || rinfo.place[cell.id]===3){ continue;}
				
				this.failcode.add("ciNotOnCnr");
				if(this.checkOnly){ break allloop;}
				clist.seterr(1);
				break;
			}
		}
	},

	checkLblock : function(){
		var rinfo = this.getLblockInfo();
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.area[id].shape!==0){ continue;}
			
			this.failcode.add("bkNotLshape");
			if(this.checkOnly){ break;}
			rinfo.area[id].clist.seterr(1);
		}
	}
},

FailCode:{
	bkNotLshape : ["ブロックが幅1のL字型になっていません。","A block is not L-shape or whose width is not one."],
	arBlkEdge  : ["矢印がブロックの端にありません。","An arrow is not at the edge of the block."],
	arNotPtCnr : ["矢印の先にブロックの角がありません。","An arrow doesn't indicate the corner of a block."],
	ciNotOnCnr : ["白丸がブロックの角にありません。","A circle is out of the corner."]
}
});
