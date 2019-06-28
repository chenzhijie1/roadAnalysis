var map,showBaseMap,baseMapAnoCtrl;

require(["esri/map",
        "bdlib/BDVecLayer",
        "bdlib/BDImgLayer",
        "bdlib/BDAnoLayer",
        "esri/layers/FeatureLayer",
        "esri/geometry/Point",
        "esri/SpatialReference",
        "dojo/domReady!"],
    function(Map,
             BDVecLayer,
             BDImgLayer,
             BDAnoLayer,
             FeatureLayer,
             Point,
             SpatialReference){
        map = new Map("MyMapDiv", {
            logo: false
        });
        var vecMap = new BDVecLayer();
        var imgMap = new BDImgLayer();
        var anoMap = new BDAnoLayer();
        map.addLayer(vecMap);
        map.addLayers([imgMap, anoMap]);
        imgMap.hide();
        anoMap.hide();

        var pt = new Point(8071406.791, 2191550.884, new SpatialReference({wkid: 102100}));
        map.centerAndZoom(pt, 15);
        var baogangLayer = new esri.layers.ArcGISDynamicMapServiceLayer(
            "http://localhost:6080/arcgis/rest/services/map/MapServer");
        map.addLayer(baogangLayer);

    });
//最短路径分析

require(["esri/map",
        "dojo/on",
        "dojo/dom",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/tasks/RouteTask",
        "esri/tasks/FeatureSet",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/TextSymbol",
        "esri/toolbars/draw",
        "esri/symbols/SimpleLineSymbol",
        "esri/tasks/RouteParameters",
        "dojo/colors",
        "esri/graphic",
        "dojo/domReady!"],
    function (Map,on,dom,
              ArcGISDynamicMapServiceLayer,
              RouteTask,
              FeatureSet,
              SimpleMarkerSymbol,
              TextSymbol,
              Draw,
              SimpleLineSymbol,
              RouteParameters,
              Color,
              Graphic
    ) {
        //创建路径分析对象
        var shortestAnalyst = new RouteTask("http://localhost:6080/arcgis/rest/services/map/NAServer/RouterLayer");
        //创建路径参数对象
        var routeParas = new RouteParameters();
        //障碍点，但是此时障碍点为空
        routeParas.barriers = new FeatureSet();
        //停靠点，但是此时停靠点为空
        routeParas.stops = new FeatureSet();
        //路径是否有方向
        routeParas.returnDirections = false;
        //是否返回路径，此处必须返回
        routeParas.returnRoutes = true;
        //空间参考
        routeParas.outSpatialReference = map.SpatialReference;
        //定义一个标志
        //selectPointID=0什么都不做
        //selectPointID=1说明是添加停靠点
        //selectPointID=2说明是添加障碍点
        var selectPointID;
        //给停靠点按钮添加点击事件
        on(dom.byId("stop"),"click",function(){
            selectPointID = 1;
        })
        //给障碍点按钮添加点击事件
        on(dom.byId("barriers"),"click",function(){
            selectPointID = 2;
        })
        //定义停靠点的符号
        var stopSymbol = new SimpleMarkerSymbol();
        stopSymbol.style = SimpleMarkerSymbol.STYLE_CROSS;
        stopSymbol.setSize(8);
        stopSymbol.setColor(new Color("#FFFFCC"));
        //定义障碍点的符号
        var barrierSymbol = new SimpleMarkerSymbol();
        barrierSymbol.style = SimpleMarkerSymbol.STYLE_X;
        barrierSymbol.setSize(8);
        barrierSymbol.setColor(new Color("#f1a340"));
        on(map, "mouse-down", function(evt){
            //通过selectPointID判断是添加是停靠点还是障碍点
            switch (selectPointID) {
                case 0:
                    break;
                case 1:
                    //获得停靠点的坐标
                    var pointStop=evt.mapPoint;
                    var gr=new Graphic(pointStop,stopSymbol);
                    //构建停靠点的参数
                    routeParas.stops.features.push(gr);
                    break;
                case 2:
                    //获得障碍点的坐标
                    var pointBarrier=evt.mapPoint;
                    var gr=new Graphic(pointBarrier,barrierSymbol);
                    //构建障碍点的参数
                    routeParas.barriers.features.push(gr);
                    break;
            }
            //如果selectPointID不等于0，将点的坐标在地图上显示出来
            if (selectPointID != 0) {
                addTextPoint("停靠点", pointStop, stopSymbol);
                addTextPoint("障碍点", pointBarrier, barrierSymbol);
                selectPointID = 0;
            }
        });
        //文本符号：文本信息，点坐标，符号
        function addTextPoint(text,point,symbol) {
            var textSymbol = new TextSymbol(text);
            textSymbol.setColor(new Color([128, 0, 0]));
            var graphicText = Graphic(point, textSymbol);
            var graphicpoint = new Graphic(point, symbol);
            //用默认的图层添加
            map.graphics.add(graphicpoint);
            map.graphics.add(graphicText);
        }
        //给分析按钮添加点击事件
        on(dom.byId("analyse"),"click",function(){
            //如果障碍点或者停靠点的个数有一个为0，提示用户参数输入不对
            if  (routeParas.stops.features.length < 2 )
            {
                alert("输入参数不全，无法分析");
                return;
            }
            //执行路径分析函数
            shortestAnalyst.solve(routeParas, showRoute)
        })
        //处理路径分析返回的结果。
        function showRoute(solveResult) {
            // map.graphics.clear();//清除之前的分析结果
            //路径分析的结果
            var routeResults = solveResult.routeResults;
            //路径分析的长度
            var res = routeResults.length;
            //路径的符号
            routeSymbol  = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([17, 208, 8]), 5);
            if (res > 0) {
                for (var i = 0; i < res; i++) {
                    var graphicroute = routeResults[i];
                    var graphic = graphicroute.route;
                    graphic.setSymbol(routeSymbol);
                    map.graphics.add(graphic);
                }
            }
            else {
                alert("没有返回结果");
            }
        }
    });