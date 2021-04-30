class MeasurePolt {
    constructor(arg) {
        this.viewer = arg.viewer
        this._lineArr = [];
        this._areaArr = [];
        this._heightArr = [];
		  this._circleArr = [];
        this.handler = null;
    }
	 
    get lineArr() {
        return this._lineArr;
    }
    get areArr() {
        return this._areaArr;
    }
    get heightArr() {
        return this._heightArr;
    }
	 
    create(type) {
        if (!type) {
            console.warn("请选择类型！");
        }
        if (type == 1) { //测量直线距离
            var line = new measureLineSpace({
                viewer: this.viewer
            });
            line.startCreate();
            this._lineArr.push(line);

        } else if (type == 2) { //测量面积
            var area = new measureAreaSpace({
                viewer: this.viewer
            });
            area.startCreate();
            this._areaArr.push(area);
        } else if (type == 3){ //测量高度
            var height = new measureHeight({
                viewer: this.viewer
            });
            height.startCreate();
            this._heightArr.push(height);
        }else if(type == 4){
			  var circle = new measureCircle({
				  viewer: this.viewer
			  });
			  circle.startCreate();
			  this._circleArr.push(circle);
		  }
		}
		
    clearAll() {
        for (var i = 0; i < this._lineArr.length; i++) {
            var line = this._lineArr[i];
            line.destroy();
        }
        this._lineArr = [];
        for (var j = 0; j < this._areaArr.length; j++) {
            var area = this._areaArr[j];
            area.destroy();
        }
        this._areaArr = [];
        for (var k = 0; k < this._heightArr.length; k++) {
            var height = this._heightArr[k];
            height.destroy();
        }
        this._heightArr = [];
		  for (var m = 0; m < this._circleArr.length; m++) {
		      var circle = this._circleArr[m];
		      circle.destroy();
		  }
		  this._circleArr = [];
    }
	 
    clearOne() {
        if (!this.handler) {
            this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        }
		  
        var that = this;
        this.handler.setInputAction(function (evt) {
            var pick = that.viewer.scene.pick(evt.position);
				
            if (Cesium.defined(pick) && pick.id) {
					var flag = false;
					for (var i = 0; i < that._lineArr.length; i++) {
					    var line = that._lineArr[i];
						 if(line.objId==pick.id.id)
						 {
							  flag = true;
							  line.destroy();
							  that.handler.destroy();
							  that.handler = null;
							  break;
						 }
					}
					
					if(!flag)
					{
						for (var j = 0; j < that._areaArr.length; j++) {
							 var area = that._areaArr[j];
							 if(area.objId==pick.id.id)
							 {
								  flag = true;
								  area.destroy();
								  that.handler.destroy();
								  that.handler = null;
								  break;
							 }
						}
					}
					
					if(!flag)
					{
						for (var k = 0; k < that._heightArr.length; k++) {
							 var height = that._heightArr[k];
							 if(height.objId == pick.id.id)
							 {
								 height.destroy();
								 that.handler.destroy();
								 that.handler = null;
								 break;
							 }
						 }
					 }
					 
				 if(!flag)
				 {
					for (var k = 0; k < that._circleArr.length; k++) {
						 var circle = that._circleArr[k];
						 if(circle.objId == pick.id.id)
						 {
							 circle.destroy();
							 that.handler.destroy();
							 that.handler = null;
							 break;
						 }
					 }
				  } 
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
}