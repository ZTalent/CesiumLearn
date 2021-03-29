class DrawPoint {
	constructor(arg) {
		//设置唯一id 备用
		this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
		this.viewer = arg.viewer;
		this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this._position = null;
		this._point = null;
	}

	//获取点
	get point(){
		return this._point;
	}
	//获取线的坐标数组
	get position(){
		return this._position;
	}
	//开始创建
	startCreate() {
			var $this = this;
			this.handler.setInputAction(function (evt) { //单机开始绘制
				var cartesian = $this.getCatesian3FromPX(evt.position);
				if (!cartesian) return;
				if(!Cesium.defined($this._point)){
					$this._point = $this.createPoint(cartesian);
					$this.handler.destroy();
				}
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		}

	createPoint(cartesian) {
		var point = this.viewer.entities.add({
			position: cartesian,
			point: {
				color: Cesium.Color.WHITE,
				pixelSize: 5,
				outlineColor:Cesium.Color.BLACK,
				outlineWidth:2,
				disableDepthTestDistance:5000000
			}
		});
		point.objId = this.objId;
		return point;
	}
	
	destroy() {
		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}
		if (this._point) {
			this.viewer.entities.remove(this._point);
			this._point = null;
		}
		this._point = null;
	}
	
	getCatesian3FromPX(px) {
		var cartesian;
		var ray = this.viewer.camera.getPickRay(px);
		if (!ray) return null;
		cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
		return cartesian;
	}
}