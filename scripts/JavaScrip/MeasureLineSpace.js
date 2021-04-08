class measureLineSpace {
	constructor(arg) {
		//设置唯一id 备用
		this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
		this.viewer = arg.viewer;
		this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this._lineArr = [];
	}

	//开始创建
	startCreate() {
			var $this = this;
			$this._lineArr = $this.calculateLineSpace($this.viewer,$this.handler);
	}

	
	calculateLineSpace(viewer, handler){
		// 取消双击事件-追踪该位置
		 this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
		 var positions = [];
		 var poly = null;
		 var distance = 0;
		 var cartesian = null;
		 var floatingPoint;
		 let ray = null;
		 var lineArr = [];
		 var $this = this;
		 
		handler.setInputAction(function (movement) {
		 	let ray = window.viewer.camera.getPickRay(movement.endPosition);
		 	cartesian = window.viewer.scene.globe.pick(ray, viewer.scene);
			if (positions.length >= 2) {
		 	  if (!Cesium.defined(poly)) {
		 		 poly = new PolyLinePrimitive(positions);
		 	  } else {
		 		 positions.pop();
		 		 positions.push(cartesian);
		 	  }
		 	  distance = getSpaceDistance(positions);
		 	}
		 }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		
		 handler.setInputAction(function (movement) {
			if (positions.length == 0) {
			  positions.push(cartesian.clone());
			}
			positions.push(cartesian);
			//在三维场景中添加Label
			var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
			var textDisance = distance + "米";
			floatingPoint = viewer.entities.add({
			  name: '空间直线距离',
			  //id: $this.objId;
			  position:cartesian,
			  point: {
				 pixelSize: 5,
				 color: Cesium.Color.RED,
				 outlineColor: Cesium.Color.WHITE,
				 outlineWidth: 2,
				 disableDepthTestDistance:5000000
			  },
			  label: {
				 text: textDisance,
				 font: '18px sans-serif',
				 fillColor: Cesium.Color.GOLD,
				 style: Cesium.LabelStyle.FILL_AND_OUTLINE,
				 outlineWidth: 2,
				 verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
				 pixelOffset: new Cesium.Cartesian2(20, -20),
			  }
			});
			lineArr.push(floatingPoint);
		 }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		
		 handler.setInputAction(function (movement) {
			handler.destroy(); //关闭事件句柄
			positions.pop(); //最后一个点无效
		 }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
		
		 var PolyLinePrimitive = (function () {
			function _(positions) {
			  this.options = {
				 name: '直线',
				 id: $this.objId,
				 polyline: {
					show: true,
					positions: [],
					material: Cesium.Color.RED,
					width: 8,
					clampToGround: true
				 }
			  };
			  this.positions = positions;
			  this._init();
			}
			_.prototype._init = function () {
			  var _self = this;
			  var _update = function () {
				 return _self.positions;
			  };
			  //实时更新polyline.positions
			  this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
			  lineArr.push(this.options);
			  viewer.entities.add(this.options);
			};
			return _;
		 })();
		 
		 //空间两点距离计算函数
		 function getSpaceDistance(positions) {
			var distance = 0;
			for (var i = 0; i < positions.length - 1; i++) {
		
			  var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
			  var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
			  /**根据经纬度计算出距离**/
			  var geodesic = new Cesium.EllipsoidGeodesic();
			  geodesic.setEndPoints(point1cartographic, point2cartographic);
			  var s = geodesic.surfaceDistance;
			  //返回两点之间的距离
			  s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
			  distance = distance + s;
			}
			return distance.toFixed(2);
		 }
		return lineArr;
	}
	
	destroy(){
		if(this.handler){
			this.handler.destroy();
			this.handler = null;
		}
		if(this._lineArr)
		{
			for (var i = 0; i < this._lineArr.length; i++) {
		    var line = this._lineArr[i];
			 if(line)
			 {
				 this.viewer.entities.remove(line);
			 }
			}
		}
		this._lineArr = [];
	}
	
}