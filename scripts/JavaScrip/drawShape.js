var viewer = new Cesium.Viewer("cesiumContainer");
//Sandcastle_Begin
//鼠标绘图
		var activeShapePoints = [];
        var activeShape;
        var floatingPoint;
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        //双击鼠标左键清除默认事件
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        //绘制点
        function createPoint(worldPosition) {
            var point = viewer.entities.add({
                position: worldPosition,
                point: {
                    color: Cesium.Color.WHITE,
                    pixelSize: 5,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
            return point;
        }
        //初始化为线
        var drawingMode = '';
        //绘制图形
        function drawShape(positionData) {
            var shape;
            if (drawingMode === 'line') {
                // shape = viewer.entities.add({
                //     polyline: {
                //         positions: positionData,
                //         clampToGround: true,
                //         width: 3
                //     }
                // });
            } else if (drawingMode === 'polygon') {
                shape = viewer.entities.add({
                    polygon: {
                        hierarchy: positionData,
                        material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.7))
                    }
                });
            } else if (drawingMode === 'circle') {
                //当positionData为数组时绘制最终图，如果为function则绘制动态图
                var value = typeof positionData.getValue === 'function' ? positionData.getValue(0) : positionData;
                //var start = activeShapePoints[0];
                //var end = activeShapePoints[activeShapePoints.length - 1];
                //var r = Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2));
                //r = r ? r : r + 1;
                shape = viewer.entities.add({
                    position: activeShapePoints[0],
                    name: 'Blue translucent, rotated, and extruded ellipse with outline',
                    type: 'Selection tool',
                    ellipse: {
                        semiMinorAxis: new Cesium.CallbackProperty(function () {
                            //半径 两点间距离
                            var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math
                                .pow(value[0].y - value[value.length - 1].y, 2));
                            return r ? r : r + 1;
                        }, false),
                        semiMajorAxis: new Cesium.CallbackProperty(function () {
                            var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math
                                .pow(value[0].y - value[value.length - 1].y, 2));
                            return r ? r : r + 1;
                        }, false),
                        material: Cesium.Color.BLUE.withAlpha(0.5),
                        outline: true
                    }
                });
            } else if (drawingMode === 'rectangle') {
                //当positionData为数组时绘制最终图，如果为function则绘制动态图
                var arr = typeof positionData.getValue === 'function' ? positionData.getValue(0) : positionData;
                shape = viewer.entities.add({
                    name: 'Blue translucent, rotated, and extruded ellipse with outline',
                    rectangle: {
                        coordinates: new Cesium.CallbackProperty(function () {
                            var obj = Cesium.Rectangle.fromCartesianArray(arr);
                            //if(obj.west==obj.east){ obj.east+=0.000001};
                            //if(obj.south==obj.north){obj.north+=0.000001};
                            return obj;
                        }, false),
                        material: Cesium.Color.RED.withAlpha(0.5)
                    }
                });
            }
            return shape;
        }
        //鼠标左键
        handler.setInputAction(function (event) {
            // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
            // we get the correct point when mousing over terrain.
            // scene.pickPosition只有在开启地形深度检测，且不使用默认地形时是准确的。
            var earthPosition = viewer.scene.pickPosition(event.position);
            // `earthPosition` will be undefined if our mouse is not over the globe.
            if (Cesium.defined(earthPosition)) {
                if (activeShapePoints.length === 0) {
                    floatingPoint = createPoint(earthPosition);
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
                createPoint(earthPosition);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动
        handler.setInputAction(function (event) {
            if (Cesium.defined(floatingPoint)) {
                var newPosition = viewer.scene.pickPosition(event.endPosition);
                if (Cesium.defined(newPosition)) {
                    floatingPoint.position.setValue(newPosition);
                    activeShapePoints.pop();
                    activeShapePoints.push(newPosition);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
 
        // Redraw the shape so it's not dynamic and remove the dynamic shape.
        function terminateShape() {
            activeShapePoints.pop(); //去除最后一个动态点
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
 
        var options = [{
            text: '无操作'
        },{
            text: '画线',
            onselect: function () {
                terminateShape();
                drawingMode = 'line';
            }
        }, {
            text: '画面',
            onselect: function () {
                terminateShape();
                drawingMode = 'polygon';
            }
        }, {
            text: '画圆',
            onselect: function () {
                terminateShape();
                drawingMode = 'circle';
            }
        }, {
            text: '画矩形',
            onselect: function () {
                terminateShape();
                drawingMode = 'rectangle';
            }
        }];
 
        Sandcastle.addToolbarMenu(options);
        Sandcastle.finishedLoading();
        // Zoom in to an area with mountains
        viewer.camera.lookAt(Cesium.Cartesian3.fromDegrees(-122.2058, 46.1955, 1000.0), new Cesium.Cartesian3(5000.0,
            5000.0, 5000.0));
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        viewer.scene.globe.depthTestAgainstTerrain = true;//开启地形深度检测，如果鼠标指针和点不重合，这个选项设置为true试试。