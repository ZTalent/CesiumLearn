// Get your own Bing Maps API key at https://www.bingmapsportal.com, prior to publishing your Cesium application:
// Cesium.BingMapsApi.defaultKey = 'put your API key here';
// Construct the default list of terrain sources.

var terrainModels = Cesium.createDefaultTerrainProviderViewModels();
		//Cesium基础窗口
		var viewer = new Cesium.Viewer('cesiumContainer',{
         	animation:false,//是否显示动画控件
         	shouldAnimate:true,
        	   homeButton:false,//是否显示Home按钮
         	fullscreenButton:false,//是否显示全屏按钮
            baseLayerPicker:true,//是否显示图层选择控件
         	geocoder: false, //是否显示地名查找控件
         	timeline: false, //是否显示时间线控件
			   vrButton:false,
            sceneModePicker: true, //是否显示投影方式控件
         	navigationHelpButton: false, //是否显示帮助信息控件
         	infoBox: true, //是否显示点击要素之后显示的信息
         	requestRenderMode: true, //启用请求渲染模式
		      //scene3DOnly: false, //每个几何实例将只能以3D渲染以节省GPU内存
       	   //sceneMode: 3, //初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
        	   //terrainProvider: Cesium.createWorldTerrain({
            //     requestWaterMask: true,
            //     requestVertexNormals: true
            //}
            //),
		});
viewer._cesiumWidget._creditContainer.style.display = "none";
viewer.scene.debugShowFramesPerSecond = false;


var globe = viewer.scene.globe;


// No depth testing against the terrain to avoid z-fighting
//地下模式设置
var isunderground=false;
viewer.scene.globe.depthTestAgainstTerrain = true;
function changeMode(){
	if(!isunderground)
	{
		isunderground=true;
		globe.translucency.enabled = true;
		viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
		changeAlpha();
	}else{
		isunderground=false;
		globe.translucency.enabled = false;
		viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
	}
}

function changeAlpha(){
	if(isunderground)
	{
		globe.translucency.enabled = true;
		var alpha=document.getElementById("myRange").value;
		globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar(1.5e2, alpha/100, 8.0e6, 1.0);
	}
}

// Bounding sphere
var boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(111.5652101, 38.70350851, 100.500143), 143.6271004);

// Set custom initial position
viewer.camera.flyToBoundingSphere(boundingSphere, { duration: 0 });


var x = 360.0;
var y = -890.0;
var z = -870.0;
var m = Cesium.Matrix4.fromArray([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    x, y, z, 1.0
]);

var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
	id:'test',
    url: '././scene/testm3DTiles.json',
    maximumScreenSpaceError: 2,
    maximumNumberOfLoadedTiles: 1000,
    modelMatrix: m 
}));

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// var params = {

//     tx: 360.0,  //模型中心X轴坐标（经度，单位：十进制度）

//     ty: -900.0,    //模型中心Y轴坐标（纬度，单位：十进制度）

//     tz: -870.0,    //模型中心Z轴坐标（高程，单位：米）

//     rx: 0.0,    //X轴（经度）方向旋转角度（单位：度）

//     ry: 0.00,    //Y轴（纬度）方向旋转角度（单位：度）

//     rz: 10.0,       //Z轴（高程）方向旋转角度（单位：度）

//     scale: 1   //缩放比例

// };

// //平移、贴地、旋转模型
// function update3dtilesMaxtrix(m_tileset) {
//     //旋转
//     var mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(params.rx));
//     var my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(params.ry));
//     var mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(params.rz));
//     var rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
//     var rotationY = Cesium.Matrix4.fromRotationTranslation(my);
//     var rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
//     //平移
//     var position = Cesium.Cartesian3.fromDegrees(params.tx, params.ty, params.tz);
//     var mt = Cesium.Transforms.eastNorthUpToFixedFrame(position);
//     //旋转、平移矩阵相乘
//     Cesium.Matrix4.multiply(mt, rotationX, mt);
//     Cesium.Matrix4.multiply(mt, rotationY, mt);
//     Cesium.Matrix4.multiply(mt, rotationZ, mt);
//     //赋值给tileset
//     m_tileset._root.transform = mt;
// 	 viewer.zoomTo(palaceTileset, new Cesium.HeadingPitchRange(0.5, -0.2, m_tileset.boundingSphere.radius * 1.0));
// }

// var palaceTileset = new Cesium.Cesium3DTileset({
// 		 id:'test_tile',
// 		 url: '././scene/testm3DTiles.json',
// 		 maximumScreenSpaceError: 2,
// 		 maximumNumberOfLoadedTiles: 1000,
// });

// palaceTileset.readyPromise.then(function (palaceTileset) {
// 		//添加到场景
// 		viewer.scene.primitives.add(palaceTileset);
// 		var longitude = 0.0 //模型需要改变的经度
// 		var latitude = 0.0 //模型需要改变的纬度
// 		var heightOffset = 800.0; //模型需要改变的高度
// 		//获取3Dtlies的bounds范围
// 		var boundingSphere = palaceTileset.boundingSphere;
// 		//获取3Dtlies的范围中心点的弧度
// 		var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
// 		//定义3Dtlies改变之后中心点的弧度
// 		var offsetvalue = Cesium.Cartographic.fromDegrees(longitude, latitude, heightOffset)
// 		//debugger
// 		//模型本身的位置
// 		var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
// 		//模型改变的位置
// 		var offset = Cesium.Cartesian3.fromRadians(offsetvalue.longitude, offsetvalue.latitude, heightOffset);
// 		//定义模型的改变状态
// 		var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
// 		//修改模型的位置
// 		palaceTileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
// 		// viewer.zoomTo(palaceTileset, new Cesium.HeadingPitchRange(0.5, -0.2, palaceTileset.boundingSphere.radius *
// 		// 	1.0));
// 	});

// var tilesetModel = new Cesium.Cesium3DTileset({
// 	url: '././scene/testm3DTiles.json',
// 	maximumScreenSpaceError: 2,
// 	maximumNumberOfLoadedTiles: 1000
// });

// viewer.scene.primitives.add(tilesetModel);

// viewer.zoomTo(tilesetModel);

 // var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
 // var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
 // var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude,-200.0);
 // var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
 // tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var activeShapePoints = [];
var activeShape;
var floatingPoint;
var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
		
function createPoint(worldPosition) {
	var point = viewer.entities.add({
		position: worldPosition,
		point: {
			color: Cesium.Color.WHITE,
			pixelSize: 5,
			outlineColor:Cesium.Color.BLACK,
		   outlineWidth:2,
			disableDepthTestDistance:5000000
			}
		});
	return point;
}

function createPoints(worldPosition) {
	var point = viewer.entities.add({
		position: worldPosition,
		point: {
			color: Cesium.Color.RED,
			pixelSize: 2,
			disableDepthTestDistance:5000000
			}
		});
	return point;
}
	  
var drawingMode='';
function drawShape(positionData){
	var shape;
	if(drawingMode=='line'){
		shape=viewer.entities.add({
			polyline:{
				positions:positionData,
				clampToGround:true,
				material: new Cesium.ColorMaterialProperty(Cesium.Color.RED),
				width:5
			}
		});
	}else if(drawingMode=="polygon"){
		shape=viewer.entities.add({
			polygon:{
				hierarchy:positionData,
				 material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.8))
			}
		});
	}
	return shape;
}
 
// Redraw the shape so it's not dynamic and remove the dynamic shape.
function terminateShape() {
	//activeShapePoints.pop(); //去除最后一个动态点
	if (activeShapePoints.length) {
		 drawShape(activeShapePoints); //绘制最终图
	}
	viewer.entities.remove(floatingPoint); //去除动态点图形（当前鼠标点）
	viewer.entities.remove(activeShape); //去除动态图形
	floatingPoint = undefined;
	activeShape = undefined;
	activeShapePoints = [];
}

handler.setInputAction(function (event) {
	terminateShape();
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
		
var boundingSphere = null; 

function zoomToTileset() {
    boundingSphere = tileset.boundingSphere;
    viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0, -2.0, 0));
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	 changeHeight(0);
}

//交互绘制点、线、面
function change(type) {
    switch (type) {
        case 0:
		handler.setInputAction(function (movement) {
		    var position = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
			 if(Cesium.defined(position))
			 {
				 createPoint(position);
			 }
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            break;
        case 1:
		  handler.setInputAction(function (movement) {
		  	var position = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
		  	// `earthPosition` will be undefined if our mouse is not over the globe.
		  	if (Cesium.defined(position)) {
		  		 if (activeShapePoints.length === 0) {
		  			  activeShapePoints.push(position);
		  			  var dynamicPositions = new Cesium.CallbackProperty(function () {
		  				  if (drawingMode === 'polygon') {
		  				  return new Cesium.Polyline(activeShapePoints);
		  				 }
		  					return activeShapePoints;
		  			  }, false);
		  			  activeShape = drawShape(dynamicPositions); //绘制动态图
		  		 }
		  		 activeShapePoints.push(position);
		  		 createPoints(position);
		  	}
		  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		terminateShape();
		drawingMode='line';
            break;
        case 2:
		  handler.setInputAction(function (movement) {
		  	var position = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
		  	// `earthPosition` will be undefined if our mouse is not over the globe.
		  	if (Cesium.defined(position)) {
		  		 if (activeShapePoints.length === 0) {
		  			  //floatingPoint = createPoints(earthPosition);
		  			  activeShapePoints.push(position);
		  			  var dynamicPositions = new Cesium.CallbackProperty(function () {
		  				  if (drawingMode === 'polygon') {
		  				  return new Cesium.PolygonHierarchy(activeShapePoints);
		  				 }
		  					return activeShapePoints;
		  			  }, false);
		  			  activeShape = drawShape(dynamicPositions); //绘制动态图
		  		 }
		  		 activeShapePoints.push(position);
		  		 createPoints(position);
		  	}
		  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		  terminateShape();
		  drawingMode='polygon';
            break;
        case 3:
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
            break;
    }
}

//模型添加
var modelgltf_entity = viewer.entities.add(new Cesium.Entity());
function addModel(Id,url){
	var entity=viewer.entities.add({
		parent:modelgltf_entity,
		id:Id,
		name:'教学楼',
		position: Cesium.Cartesian3.fromDegrees(111.5653101, 38.70480851, 0.600143),
		model: {
			// 引入模型
			uri: url,
			// 模型的近似最小像素大小，而不考虑缩放。这可以用来确保即使观看者缩小也可以看到模型。如果为0.0，则不强制使用最小大小
			minimumPixelSize: 1280,
			// 模型的颜色（与模型的渲染颜色混合的属性）
			color: Cesium.Color.WHITE.withAlpha(1),
			// 模型的最大比例大小
			maximumScale: 1,
			// 设置模型轮廓（边框）颜色
			silhouetteColor: Cesium.Color.BLACK,
			// 设置模型轮廓（边框）大小
			silhouetteSize: 0,
			// 是否执行模型动画
			runAnimations: true,
			// 应用于图像的统一比例。比例大于会1.0放大标签，而比例小于会1.0缩小标签。
			scale: 1.0,
			// 是否显示
		},
});
	
entity.description='\
<p>\ 这是一个用来进行测试导入模型的gltf格式的模型</p>';
}

//模型和3DTile的可视性
var model_loaded=true;
addModel(123,'./model/source/building3/building3.gltf');
function changeModelVisible(){
	tileset.show = !tileset.show;
	if(!model_loaded)
	{
		model_loaded = true;
		addModel(123,'./model/source/building3/building3.gltf');
		modelgltf_entity.show=true;
	}else{
		modelgltf_entity.show=!modelgltf_entity.show;
	}
}

//删除所有Entity保留模型
function deleteEntities() {
	var entitys = viewer.entities._entities._array;
	for (var i = 0; i < entitys.length; i++) {
		if(!entitys[i]._name)
		{ 
			viewer.entities.remove(entitys[i]);
			i--;
		}
	}           
}

var blueBox=viewer.entities.add({
	id:'blue',
	name:'蓝色盒子',
	position: Cesium.Cartesian3.fromDegrees(111.5675101, 38.70500851, 30.600143),
	box:{
		dimensions : new Cesium.Cartesian3(90.0,90.0,150.0),
		material : Cesium.Color.BLUE.withAlpha(1.0),
		outline : true,
		outlineColor : Cesium.Color.BLACK
	}
});

blueBox.description='\
<p>\ 这是一个部分在地底下，部分在地面上的蓝色不透明的盒子</p>';


var redBox=viewer.entities.add({
	id:'red',
	name:'红色盒子',
	position: Cesium.Cartesian3.fromDegrees(111.5700101, 38.70500851, 30.600143),
	box:{
		dimensions : new Cesium.Cartesian3(90.0,90.0,150.0),
		material : Cesium.Color.RED.withAlpha(1.0),
		outline : true,
		outlineColor : Cesium.Color.BLACK
	}
});

redBox.description='\
<p>\ 这是一个部分在地底下，部分在地面上的红色不透明的盒子</p>';

var yellowBox=viewer.entities.add({
	id:'yellow',
	name:'黄色盒子',
	position: Cesium.Cartesian3.fromDegrees(111.5720101, 38.70500851, 30.600143),
	box:{
		dimensions : new Cesium.Cartesian3(90.0,90.0,150.0),
		material : Cesium.Color.YELLOW.withAlpha(1.0),
		outline : true,
		outlineColor : Cesium.Color.BLACK
	}
});
yellowBox.description='\
<p>\ 这是一个部分在地底下，部分在地面上的黄色不透明的盒子</p>';

/***************************************计算两点线之间线的距离********************************************************************/
function calculateLineLength()
{
	measureLineSpace(viewer,handler);
}


function measureLineSpace(viewer, handler) {
 // 取消双击事件-追踪该位置
 viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
 //handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
 var positions = [];
 var poly = null;
 var distance = 0;
 var cartesian = null;
 var floatingPoint;
 let ray = null;
 
handler.setInputAction(function (movement) {
 	let ray = window.viewer.camera.getPickRay(movement.endPosition);
 	cartesian = window.viewer.scene.globe.pick(ray, viewer.scene);
	//cartesian = viewer.scene.pickPosition(movement.endPosition);
 	//cartesian = window.viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
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
	//cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
	//let ray = window.viewer.camera.getPickRay(movement.endPosition);
	//cartesian = window.viewer.scene.globe.pick(ray, viewer.scene);
	
	console.log(cartesian);
	if (positions.length == 0) {
	  positions.push(cartesian.clone());
	}
	positions.push(cartesian);
	//在三维场景中添加Label
	var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
	var textDisance = distance + "米";
	floatingPoint = viewer.entities.add({
	  name: '空间直线距离',
	  //position: Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180,cartographic.height),
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
 }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

 handler.setInputAction(function (movement) {
	handler.destroy(); //关闭事件句柄
	positions.pop(); //最后一个点无效
 }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

 var PolyLinePrimitive = (function () {
	function _(positions) {
	  this.options = {
		 name: '直线',
		 polyline: {
			show: true,
			positions: [],
			material: Cesium.Color.RED,
			width: 5,
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
}
/***************************************计算两点线之间线的距离结束********************************************************************/



/***************************************计算区域面积********************************************************************/
function calculateAreaSpace()
{
	measureAreaSpace(viewer,handler);
}

function measureAreaSpace(viewer, handler){  
  // 取消双击事件-追踪该位置
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  // 鼠标事件
    // handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
    var positions = [];
    var tempPoints = [];
    var polygon = null;
    // var tooltip = document.getElementById("toolTip");
    var cartesian = null;
    var floatingPoint;//浮动点
    // tooltip.style.display = "block";
    
    handler.setInputAction(function(movement){
        // tooltip.style.left = movement.endPosition.x + 3 + "px";
        // tooltip.style.top = movement.endPosition.y - 25 + "px";
    // tooltip.innerHTML ='<p>单击开始，右击结束</p>';
        // cartesian = viewer.scene.pickPosition(movement.endPosition); 
      let ray = viewer.camera.getPickRay(movement.endPosition);
      cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
        if(positions.length >= 2){
            if (!Cesium.defined(polygon)) {
                polygon = new PolygonPrimitive(positions);
            }else{
                positions.pop();
                // cartesian.y += (1 + Math.random());
                positions.push(cartesian);
            }
            // tooltip.innerHTML='<p>'+distance+'米</p>';
        }
    },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    
    handler.setInputAction(function(movement){
        // tooltip.style.display = "none";
        // cartesian = viewer.scene.pickPosition(movement.position); 
      let ray = viewer.camera.getPickRay(movement.position);
      cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
        if(positions.length == 0) {
            positions.push(cartesian.clone());
        }
        //positions.pop();
        positions.push(cartesian);
        //在三维场景中添加点
        var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        var heightString = cartographic.height;
        tempPoints.push({ lon: longitudeString, lat: latitudeString ,hei:heightString});
        floatingPoint = viewer.entities.add({
            name : '多边形面积',
            position : positions[positions.length - 1],         
            point : {
                pixelSize : 5,
                color : Cesium.Color.RED,
                outlineColor : Cesium.Color.WHITE,
                outlineWidth : 2,
                heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
					 disableDepthTestDistance:5000000
            }
        }); 
    },Cesium.ScreenSpaceEventType.LEFT_CLICK);
     
    handler.setInputAction(function(movement){
        handler.destroy();
        positions.pop();
        //tempPoints.pop();
        // viewer.entities.remove(floatingPoint);
        // tooltip.style.display = "none";
        //在三维场景中添加点
        // var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
        // var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
        // var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
        // var heightString = cartographic.height;
        // tempPoints.push({ lon: longitudeString, lat: latitudeString ,hei:heightString});
 
        var textArea = getArea(tempPoints) + "平方公里";
        viewer.entities.add({
            name : '多边形面积',
            position : positions[positions.length - 1],
            // point : {
            //  pixelSize : 5,
            //  color : Cesium.Color.RED,
            //  outlineColor : Cesium.Color.WHITE,
            //  outlineWidth : 2,
            //  heightReference:Cesium.HeightReference.CLAMP_TO_GROUND 
            // },
            label : {
                text : textArea,
                font : '18px sans-serif',
                fillColor : Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth : 2,
                verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
        pixelOffset : new Cesium.Cartesian2(20, -40),
        heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });     
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK );   
 
    var radiansPerDegree = Math.PI / 180.0;//角度转化为弧度(rad) 
    var degreesPerRadian = 180.0 / Math.PI;//弧度转化为角度
    
    //计算多边形面积
    function getArea(points) {
        
        var res = 0;
        //拆分三角曲面
 
        for (var i = 0; i < points.length - 2; i++) {
            var j = (i + 1) % points.length;
            var k = (i + 2) % points.length;
            var totalAngle = Angle(points[i], points[j], points[k]);
 
            
            var dis_temp1 = distance(positions[i], positions[j]);
            var dis_temp2 = distance(positions[j], positions[k]);
            res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle)) ;
            console.log(res);
        }
        
        
        return (res/1000000.0).toFixed(4);
    }
 
    /*角度*/
    function Angle(p1, p2, p3) {
        var bearing21 = Bearing(p2, p1);
        var bearing23 = Bearing(p2, p3);
        var angle = bearing21 - bearing23;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }
    /*方向*/
    function Bearing(from, to) {
        var lat1 = from.lat * radiansPerDegree;
        var lon1 = from.lon * radiansPerDegree;
        var lat2 = to.lat * radiansPerDegree;
        var lon2 = to.lon * radiansPerDegree;
        var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
        if (angle < 0) {
            angle += Math.PI * 2.0;
        }
        angle = angle * degreesPerRadian;//角度
        return angle;
    } 
 
    var PolygonPrimitive = (function(){
        function _(positions){
            this.options = {
                name:'多边形',
                polygon : {
                    hierarchy : [],
                    // perPositionHeight : true,
          material : Cesium.Color.GREEN.withAlpha(0.5),
          // heightReference:20000
                }
            };
            
            this.hierarchy = {positions};
            this._init();
        }
    
        _.prototype._init = function(){
            var _self = this;
            var _update = function(){
                return _self.hierarchy;
            };
            //实时更新polygon.hierarchy
            this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update,false);
            viewer.entities.add(this.options);
        };
    
        return _;
    })();
 
    function distance(point1,point2){
        var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
        var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
        /**根据经纬度计算出距离**/
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
        //返回两点之间的距离
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2)); 
        return s;
    }
}
/***************************************计算区域面积结束********************************************************************/

