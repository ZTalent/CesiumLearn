class measureHeight {
	constructor(arg) {
		//设置唯一id 备用
		this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
		//this.objId = Number(Math.random());
		this.viewer = arg.viewer;
		this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this._heightArr = [];
	}

	//开始创建
	startCreate() {
			var $this = this;
			$this._heightArr = $this.calculateHeight($this.viewer,$this.handler);
   }

	
		calculateHeight(viewer,handler){
		handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
		var positions = [];
		var poly = null;
		var cartesian = null;
		var floatingPoint;
		var loc=0;
		var height = 0;
		var heightArr = [];
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
				  height = getHeight();
			 }
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		handler.setInputAction(function(movement){
				if(positions.length == 0) {
					positions.push(cartesian.clone());
					positions.push(cartesian);
					floatingPoint = viewer.entities.add({
					name : '起始点',
					position : positions[0],				
					point : {
						pixelSize : 5,
						color : Cesium.Color.RED,
						outlineColor : Cesium.Color.WHITE,
						outlineWidth : 2,
						disableDepthTestDistance:5000000
						},
					label : {
						text : "0米",
						font : '18px sans-serif',
						fillColor : Cesium.Color.GOLD,
						style: Cesium.LabelStyle.FILL_AND_OUTLINE,
						outlineWidth : 2,
						verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
						pixelOffset : new Cesium.Cartesian2(20, -20)
						}
					});
					heightArr.push(floatingPoint);
				}			
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		handler.setInputAction(function(movement){
			handler.destroy();
			var textDisance=height+"米";
			var cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
			var lon = Cesium.Math.toDegrees(cartographic.longitude);
			var lat = Cesium.Math.toDegrees(cartographic.latitude);
			var tem = viewer.entities.add({
				name : '直线距离',
				position :Cesium.Cartesian3.fromDegrees(lon, lat, height),
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
			heightArr.push(tem);
		 },Cesium.ScreenSpaceEventType.RIGHT_CLICK);
		 
		 function getHeight(){
			 var h = window.innerHeight;
			 document.onmousemove = function(e){
					loc =e.pageY;
			 }
			 return (h-loc)/2;
		 }

		var HeightLinePrimitive = (function () {
			 function _(positions) {
				 var cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
				 var lon = Cesium.Math.toDegrees(cartographic.longitude);
				 var lat = Cesium.Math.toDegrees(cartographic.latitude);
				 var test_position=[];
				 test_position.push(Cesium.Cartesian3.fromDegrees(lon, lat, 0));
				 test_position.push(Cesium.Cartesian3.fromDegrees(lon, lat, getHeight()));
				 this.options = {
						name:'高度',
						id: $this.objId,
						polyline : {					
							show : true,
							positions : [],
							material : new Cesium.PolylineOutlineMaterialProperty({
												 color : new Cesium.Color(0.9333333,0.6784313,0.13333333,0.8),
												 outlineWidth : 1,
												 outlineColor : Cesium.Color.WHITE
											}),
							width : 8						
							},
						ellipse:{
							show : true,
							// semiMinorAxis : 30.0,
							// semiMajorAxis : 30.0,
							// height: 20.0,
							material : Cesium.Color.GREEN.withAlpha(0.5),
							outline : true // height must be set for outline to display
						}
					};
				  
				 this.positions = positions;
				 this._init();
			 }
			 _.prototype._init = function () {
				var _self = this;
				var _update = function () {
					var temp_position =[];
					temp_position.push( _self.positions[0]);
					var point1cartographic = Cesium.Cartographic.fromCartesian(_self.positions[0]);
					var point2cartographic = Cesium.Cartographic.fromCartesian(_self.positions[1]);					
					var point_temp = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(point1cartographic.longitude), Cesium.Math.toDegrees(point1cartographic.latitude),height);
					temp_position.push(point_temp);
					return temp_position;
				};
				
				var _update_ellipse=function(){
					return _self.positions[0];
				}
				
				var _semiMinorAxis = function(){
					var point1cartographic = Cesium.Cartographic.fromCartesian(_self.positions[0]);
					var point2cartographic = Cesium.Cartographic.fromCartesian(_self.positions[1]);
					/**根据经纬度计算出距离**/
					var geodesic = new Cesium.EllipsoidGeodesic();
					geodesic.setEndPoints(point1cartographic, point2cartographic);
					var s = geodesic.surfaceDistance;
					return s/5;
				};
				
				var _height = function(){
					var height_temp = height;
					return height_temp;
				}

			  this.options.polyline.positions = new Cesium.CallbackProperty(_update,false);
			  this.options.position = new Cesium.CallbackProperty(_update_ellipse,false);
			  this.options.ellipse.semiMinorAxis =new Cesium.CallbackProperty(_semiMinorAxis,false);
			  this.options.ellipse.semiMajorAxis = new Cesium.CallbackProperty(_semiMinorAxis,false);
			  this.options.ellipse.height =  new Cesium.CallbackProperty(_height,false);
			  heightArr.push(this.options);
			  viewer.entities.add(this.options);
			 };
			 return _;
		})();
		return heightArr;
	}
	
	destroy(){
			if(this.handler){
				this.handler.destroy();
				this.handler = null;
			}
			if(this._heightArr)
			{
				for (var i = 0; i < this._heightArr.length; i++) {
			    var height = this._heightArr[i];
				 if(height)
				 {
					 this.viewer.entities.remove(height);
				 }
				}
			}
			this._heightArr = [];
		}
	
}