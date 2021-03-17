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
            //    requestVertexNormals: true
            //}
            //),
		});
viewer._cesiumWidget._creditContainer.style.display = "none";
viewer.scene.debugShowFramesPerSecond = true;

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

// Add tileset. Do not forget to reduce the default screen space error to 2
// var origin = Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 200000.0);
// var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
var x = 360.0;
var y = -920.0;
var z = -820.0;
// var x = 0;
// var y = 0;
// var z = 0;
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
    modelMatrix: m  //方法一，动态修改modelMatrix
}));




var activeShapePoints = [];
var activeShape;
var floatingPoint;
var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
		
function createPoint(worldPosition) {
	worldPosition.z=worldPosition.z + 10.0;
	var point = viewer.entities.add({
		position: worldPosition,
		point: {
			color: Cesium.Color.WHITE,
			pixelSize: 10,
			outlineColor:Cesium.Color.BLACK,
			outlineWidth:2
			}
		});
	return point;
}

function createPoints(worldPosition) {
	var point = viewer.entities.add({
		position: worldPosition,
		point: {
			color: Cesium.Color.RED,
			pixelSize: 3,
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
				 material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.7))
			}
		});
	}
	return shape;
}

//鼠标移动
// handler.setInputAction(function (event) {
// 	if (Cesium.defined(floatingPoint)) {
// 		 var newPosition = viewer.scene.pickPosition(event.endPosition);
// 		 if (Cesium.defined(newPosition)) {
// 			  floatingPoint.position.setValue(newPosition);
// 			  activeShapePoints.pop();
// 			  activeShapePoints.push(newPosition);
// 		console.log(newPosition);
// 		 }
// 	}
// }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
 
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
		  	var earthPosition = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
		  	// `earthPosition` will be undefined if our mouse is not over the globe.
		  	if (Cesium.defined(earthPosition)) {
		  		 if (activeShapePoints.length === 0) {
		  			  activeShapePoints.push(earthPosition);
		  			  var dynamicPositions = new Cesium.CallbackProperty(function () {
		  				  if (drawingMode === 'polygon') {
		  				  return new Cesium.Polyline(activeShapePoints);
		  				 }
		  					return activeShapePoints;
		  			  }, false);
		  			  activeShape = drawShape(dynamicPositions); //绘制动态图
		  		 }
		  		 activeShapePoints.push(earthPosition);
		  		 createPoints(earthPosition);
		  	}
		  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		terminateShape();
		drawingMode='line';
            break;
        case 2:
		  handler.setInputAction(function (movement) {
		  	var earthPosition = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
		  	// `earthPosition` will be undefined if our mouse is not over the globe.
		  	if (Cesium.defined(earthPosition)) {
		  		 if (activeShapePoints.length === 0) {
		  			  //floatingPoint = createPoints(earthPosition);
		  			  activeShapePoints.push(earthPosition);
		  			  var dynamicPositions = new Cesium.CallbackProperty(function () {
		  				  if (drawingMode === 'polygon') {
		  				  return new Cesium.PolygonHierarchy(activeShapePoints);
		  				 }
		  					return activeShapePoints;
		  			  }, false);
		  			  activeShape = drawShape(dynamicPositions); //绘制动态图
		  		 }
		  		 activeShapePoints.push(earthPosition);
		  		 createPoints(earthPosition);
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
var test_entity = viewer.entities.add(new Cesium.Entity());
function addModel(Id,url){
	var entity=viewer.entities.add({
		parent:test_entity,
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
// 	   label:{
// 		 text:"教学楼",
// 		 font : '14pt Source Han Sans CN',    //字体样式
//        fillColor:Cesium.Color.BLACK,        //字体颜色
//        backgroundColor:Cesium.Color.AQUA,    //背景颜色
//        showBackground:true,                //是否显示背景颜色
//        style: Cesium.LabelStyle.FILL,        //label样式
//        outlineWidth : 2,                    
//        verticalOrigin : Cesium.VerticalOrigin.CENTER,//垂直位置
//        horizontalOrigin :Cesium.HorizontalOrigin.LEFT,//水平位置
//        pixelOffset:new Cesium.Cartesian3(10,0,100)            //偏移
// 	  },
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
		test_entity.show=true;
	}else{
		test_entity.show=!test_entity.show;
	}
}

//删除所有Entity保留模型
function deleteEntities() {
	var entitys = viewer.entities._entities._array;
	for (var i = 0; i < entitys.length; i++) {
		if(!entitys[i]._name)
		{ 
			console.log(entitys[i]._id);
			console.log(entitys[i]._name);
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

// var redBox = viewer.entities.add({
//   name : 'Red box with black outline',
//   position: Cesium.Cartesian3.fromDegrees(111.5953101, 38.71480851, 0.000000),
//   box : {
//     dimensions : new Cesium.Cartesian3(400000.0, 300000.0, 500000.0),
//     material : Cesium.Color.RED.withAlpha(0.5),
//     outline : true,
//     outlineColor : Cesium.Color.BLACK
//   }
// });



//方法二，直接调用函数，调整高度,height表示物体离地面的高度
function changeHeight(height) {
    height = Number(height);
    if (isNaN(height)) {
        return;
    }
    var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
    var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
    var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude,height);
    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
    //tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
}