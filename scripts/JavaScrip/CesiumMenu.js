// Get your own Bing Maps API key at https://www.bingmapsportal.com, prior to publishing your Cesium application:
// Cesium.BingMapsApi.defaultKey = 'put your API key here';
// Construct the default list of terrain sources.
 Cesium.Ion.defaultAccessToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNzIyZDQ4MS0wMWFjLTQ0NmEtYjNjZC1mNjcwMjA5NzEzYmYiLCJpZCI6NDkyMTYsImlhdCI6MTYxNzM0NTEzNH0.RCV9Inpx2XCLua5qHHndZkGcn2RUrczpfZSaVjvOy8s';

var pkutex = new Cesium.WebMapTileServiceImageryProvider({
	url:
	  "http://162.105.86.226/mapcache/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=SATE&TILEMATRIXSET=WebMercator&TILEMATRIX={TileMatrix}&TILECOL={TileCol}&TILEROW={TileRow}&STYLE=default&FORMAT=image%2Fpng",
	layer: "SATE",
	format: "image/png",
	maximumLevel: 18,
 });
 
 var pkudem = new Cesium.CesiumTerrainProvider({
 	url:'http://162.105.86.226/DEM/'
 });

var terrainModels = Cesium.createDefaultTerrainProviderViewModels();
//Cesium基础窗口
var viewer = new Cesium.Viewer('cesiumContainer',{
		//imageryProvider:pkutex,
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

viewer.terrainProvider = pkudem;
viewer.imageryLayers.addImageryProvider(pkutex);
viewer._cesiumWidget._creditContainer.style.display = "none";
// viewer.scene.debugShowFramesPerSecond = false;


//交互绘制点、线、面
var draw = new DrawPolt({
		viewer:viewer
	});

//直线、面积、高度测量
var measure = new MeasurePolt({
		viewer:viewer
	});	

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
var boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(116.310, 39.9800, 100.500143), 143.6271004);

// Set custom initial position
// viewer.camera.flyToBoundingSphere(boundingSphere, { duration: 0 });

viewer.camera.setView({
    destination: new Cesium.Cartesian3.fromDegrees(116.310, 39.9800, 500)
  });
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

var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
//交互绘制点、线、面
function drawGeometry(type) {
    switch (type) {
        case 0:
			draw.create(1);
			//measure.create(1);
         break;
        case 1:
			draw.create(2);
         break;
        case 2:
		   draw.create(3);
         break;
        case 3:
         draw.clearOne();
         break;
		  case 4:
			draw.clearAll();
			break;
    }
}
//线段、面积、高度测量
function measureSpace(type) {
		switch(type) {
			case(0):
				measure.create(1);
				break;
			case(1):
				measure.create(2);
				break;
			case(2):
				measure.create(3);
				break;
			case(3):
				measure.clearOne();
				break;
			case(4):
				measure.clearAll();
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
		position: Cesium.Cartesian3.fromDegrees(116.308, 39.9894, 50),
		model: {
			// 引入模型
			uri: url,
			// 模型的近似最小像素大小，而不考虑缩放。这可以用来确保即使观看者缩小也可以看到模型。如果为0.0，则不强制使用最小大小
			minimumPixelSize: 0,
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
addModel(123,'http://162.105.86.226:8009/static/upload/files/building3.gltf');
function changeModelVisible(){
	tileset.show = !tileset.show;
	if(!model_loaded)
	{
		model_loaded = true;
		addModel(123,'http://162.105.86.226:8009/static/upload/files/building3.gltf');
		modelgltf_entity.show=true;
	}else{
		modelgltf_entity.show=!modelgltf_entity.show;
	}
}

//删除所有Entity保留模型
function deleteOneEntity() {
	draw.clearOne();
}

function deleteAllEntities(){
	draw.clearAll();
}

var blueBox=viewer.entities.add({
	id:'blue',
	name:'蓝色盒子',
	position: Cesium.Cartesian3.fromDegrees(116.305, 39.9894, 30.600143),
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
	position: Cesium.Cartesian3.fromDegrees(116.300, 39.9894, 30.600143),
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
	position: Cesium.Cartesian3.fromDegrees(116.295, 39.9894,30.600143),
	box:{
		dimensions : new Cesium.Cartesian3(90.0,90.0,150.0),
		material : Cesium.Color.YELLOW.withAlpha(1.0),
		outline : true,
		outlineColor : Cesium.Color.BLACK
	}
});
yellowBox.description='\
<p>\ 这是一个部分在地底下，部分在地面上的黄色不透明的盒子</p>';