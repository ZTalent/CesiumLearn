class measureCircle {
	constructor(arg) {
		//设置唯一id 备用
		this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
		this.viewer = arg.viewer;
		this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this._circleArr = [];
	}

	//开始创建
	startCreate() {
			var $this = this;
			$this._circleArr = $this.calculateCircle($this.viewer,$this.handler);
   }

	
		calculateCircle(viewer,handler){
				handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
				var positions = [];
				var poly = null;
				var cartesian = null;
				var floatingPoint;
				
				var circle_info = [];
				var area = 0;
				var circleArr = [];
				var $this = this;
		
				handler.setInputAction(function (movement) {
						 let ray = viewer.camera.getPickRay(movement.endPosition);
						 cartesian = viewer.scene.globe.pick(ray, viewer.scene);
					 if (positions.length >= 2) {
						  if (!Cesium.defined(poly)) {
							  poly = new HeightLinePrimitive(positions);
						  } else {
								positions.pop();
								positions.push(cartesian);
						  }
						  circle_info = getSpaceArea(positions);
					 }
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		
				handler.setInputAction(function(movement){
						if(positions.length == 0) {
							positions.push(cartesian.clone());
							positions.push(cartesian);
							floatingPoint = viewer.entities.add({
							name : '原点',
							position : positions[0],				
							point : {
								pixelSize : 5,
								color : Cesium.Color.RED,
								outlineColor : Cesium.Color.WHITE,
								outlineWidth : 2,
								disableDepthTestDistance:5000000
								},
							});
							circleArr.push(floatingPoint);
						}
					}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		
				handler.setInputAction(function(movement){
					handler.destroy();
					var textDisance="半径:"+circle_info[0]+"米\n 周长:"+circle_info[1]+"米\n面积:"+ circle_info[2] + "平方公里";
					var tem = viewer.entities.add({
						name : '直线距离',
						position :positions[0],
						point : {
							pixelSize : 5,
							color : Cesium.Color.RED,
							outlineColor : Cesium.Color.WHITE,
							outlineWidth : 2,
							},
						label : {
							text : textDisance,
							font : '18px sans-serif',
							fillColor : Cesium.Color.GOLD,
							style: Cesium.LabelStyle.FILL_AND_OUTLINE,
							outlineWidth : 2,
							verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
							pixelOffset : new Cesium.Cartesian2(20, -20)
							}
					});
					circleArr.push(tem);
				 },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
				 
				 
				 
				var HeightLinePrimitive = (function () {
					 function _(positions) {
						 var cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
						 var lon = Cesium.Math.toDegrees(cartographic.longitude);
						 var lat = Cesium.Math.toDegrees(cartographic.latitude);
						 this.options = {
								name:'面积',
								id: $this.objId,
								ellipse:{
									show : true,
									// semiMinorAxis : 30.0,
									// semiMajorAxis : 30.0,
									height: 0.1,
									material : Cesium.Color.GREEN.withAlpha(0.5),
									outline: true,
									outlineColor: Cesium.Color.WHITE,
									outlineWidth: 10
								}
							};
						  
						 this.positions = positions;
						 this._init();
					 }
					 _.prototype._init = function () {
						var _self = this;
						var _update_ellipse=function(){
							return _self.positions[0];
						}
						var _semiMinorAxis = function(){
							var point1cartographic = Cesium.Cartographic.fromCartesian(_self.positions[0]);
							var point2cartographic = Cesium.Cartographic.fromCartesian(_self.positions[_self.positions.length-1]);
							/**根据经纬度计算出距离**/
							var geodesic = new Cesium.EllipsoidGeodesic();
							geodesic.setEndPoints(point1cartographic, point2cartographic);
							var s = geodesic.surfaceDistance;
							return s;
						};
						
					  this.options.position = new Cesium.CallbackProperty(_update_ellipse,false);
					  this.options.ellipse.semiMinorAxis =new Cesium.CallbackProperty(_semiMinorAxis,false);
					  this.options.ellipse.semiMajorAxis = new Cesium.CallbackProperty(_semiMinorAxis,false);
					  circleArr.push(this.options);
					  viewer.entities.add(this.options);
					 };
					 return _;
				})();
				
				function getSpaceArea(positions) {
					var m_circle_info = [];
					var circle_area = 0;
					var circumference = 0;
					var point1cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
					var point2cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
					/**根据经纬度计算出距离**/
					var geodesic = new Cesium.EllipsoidGeodesic();
					geodesic.setEndPoints(point1cartographic, point2cartographic);
					var s = geodesic.surfaceDistance;
					//返回两点之间的距离
					s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
					circle_area =Math.pow(s,2)*3.1415926536;
					circumference = 2*3.1415926536*s;
					m_circle_info.push(s.toFixed(3));
					m_circle_info.push(circumference.toFixed(3));
					m_circle_info.push((circle_area/1000000).toFixed(6));
					return m_circle_info;
				}
				return circleArr;
			}
	
	destroy(){
			if(this.handler){
				this.handler.destroy();
				this.handler = null;
			}
			if(this._circleArr)
			{
				for (var i = 0; i < this._circleArr.length; i++) {
			    var circle = this._circleArr[i];
				 if(circle)
				 {
					 this.viewer.entities.remove(circle);
				 }
				}
			}
			this._circleArr = [];
		}
	
}