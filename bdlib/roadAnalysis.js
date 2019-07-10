define(["dojo/_base/declare"], function (declare) {
    return declare("aClass", null, {
        /*            constructor:function(){
             构造函数是声明一个实例时使用，我们这里并没有使用它，所以注释掉
             },*/
        //开始站点事件
        addStops: function () {
            removeEventHandlers();
            mapOnClick_addStops_connect = map.on("click", addStop);
        },

        //添加标记点击事件
        addSymbolclicks: function () {
            console.log(1);
        },

        //清空站点
        clearStops: function () {
            removeEventHandlers();
            for (var i = routeParams.stops.features.length - 1; i >= 0; i--) {
                map.graphics.remove(routeParams.stops.features.splice(i, 1)[0]);
            }
            $("#info").load(location.href + " .panel panel-primary");
            $("#info").load(location.href + " .panel-heading");
            $("#info").load(location.href + " .panel-title");
            $("#info").load(location.href + " .list-group");
            map.infoWindow.hide();
        },

        //增加站点
        addStop: function (evt) {
            require(["esri/graphic", "esri/InfoTemplate", "esri/symbols/TextSymbol", "esri/Color"], function (Graphic,
                InfoTemplate, TextSymbol, Color) {
                var graphic = new Graphic(evt.mapPoint, stopSymbol);
                for (var i = 0; i <= routeParams.stops.features.length; i++) {
                    var infoTemplate = new InfoTemplate();
                    infoTemplate.setTitle("站点" + (i + 1));
                    infoTemplate.setContent('<div><img src="../img/location.png">第' + (i + 1) + "个标记" + '</div>');
                    graphic.setInfoTemplate(infoTemplate);
                }
                routeParams.stops.features.push(
                    map.graphics.add(graphic)
                );
            });
        },

        //开始增加路障事件
        addBarriers: function () {
            removeEventHandlers();
            mapOnClick_addBarriers_connect = map.on("click", addBarrier);
        },

        //清空路障
        clearBarriers: function () {
            removeEventHandlers();
            for (var i = routeParams.barriers.features.length - 1; i >= 0; i--) {
                map.graphics.remove(routeParams.barriers.features.splice(i, 1)[0]);
            }
        },

        //增加路障
        addBarrier: function (evt) {
            require(["esri/graphic", "esri/InfoTemplate"], function (Graphic, InfoTemplate) {
                var graphic1 = new Graphic(evt.mapPoint, barrierSymbol);
                for (var i = 0; i <= routeParams.barriers.features.length; i++) {
                    var infoTemplate = new InfoTemplate();
                    infoTemplate.setTitle("路障" + (i + 1));
                    infoTemplate.setContent('<div><img src="../img/luzhang.png">第' + (i + 1) + "个路障" + '</div>');
                    graphic1.setInfoTemplate(infoTemplate);
                }

                $("#info").load(location.href + " .list-group");
                routeParams.barriers.features.push(
                    map.graphics.add(graphic1)
                );
            });
        },

        //清除事件
        removeEventHandlers: function () {
            if (mapOnClick_addStops_connect != null) {
                mapOnClick_addStops_connect.remove();
            }
            if (mapOnClick_addBarriers_connect != null) {
                mapOnClick_addBarriers_connect.remove();
            }
        },

        //路径分析
        solveRoute: function () {
            dojo.byId("direction").innerHTML = "";
            removeEventHandlers();
            $("#info").load(location.href + " .list-group");
            routeTask.solve(routeParams, showRoute, errorHandler);
        },

        //清空路径
        clearRoutes: function () {
            for (var i = routes.length - 1; i >= 0; i--) {
                map.graphics.remove(routes.splice(i, 1)[0]);
            }
            routes = [];
            dojo.byId("direction").innerHTML = "";
        },

        //绘制最优路径至地图
        showRoute: function (result) {
            clearRoutes();
            var routeResults = result.routeResults;
            console.log(routeResults);
            routes.push(
                map.graphics.add(routeResults[0].route.setSymbol(routeSymbol))
            );
            var directions = routeResults[0].directions;
            require(["dojo/_base/array"], function (array) {
                var dhtml = "";
                array.map(directions.features, function (feature) {
                    var time;
                    var useTime;
                    var distance = parseInt(feature.attributes.length) + "米";
                    time = feature.attributes.time;
                    useTime = time.toFixed(2) + "分";
                    if (feature.attributes.maneuverType == "esriDMTStop") {
                        dhtml += "<img src='../img/location3.png'>" + feature.attributes.text + "<br>";
                    } else if (feature.attributes.maneuverType == "esriDMTStraight") {
                        dhtml += "<img src='../img/zhixing1.png'>" + feature.attributes.text + "距离" +
                            distance + "预计用时" + useTime + "<br>";
                    } else if (feature.attributes.maneuverType == "esriDMTUTurn") {
                        dhtml += "<img src='../img/diaotou.png'>" + feature.attributes.text + "距离" +
                            distance + "预计用时" + useTime + "<br>";
                    } else if (feature.attributes.maneuverType == "esriDMTRampRight") {
                        dhtml += "<img src='../img/zhixing.png'>" + feature.attributes.text + "距离" +
                            distance + "预计用时" + useTime + "<br>";
                    } else if (feature.attributes.maneuverType == "esriDMTTurnRight" || feature.attributes
                        .maneuverType == "esriDMTTurnRightLeft") {
                        dhtml += "<img src='../img/youzhuan.png'>" + feature.attributes.text + "距离" +
                            distance + "预计用时" + useTime + "<br>";
                    } else if (feature.attributes.maneuverType == "esriDMTTurnLeftRight") {
                        dhtml += "<img src='../img/zuozhuan.png'>" + feature.attributes.text + "距离" +
                            distance + "预计用时" + useTime + "<br>";
                    } else if (feature.attributes.maneuverType == "esriDMTForkLeft") {
                        dhtml += "<img src='../img/left.png'>" + feature.attributes.text + "距离" + distance +
                            "预计用时" + useTime + "<br>";
                    } else if (feature.attributes.maneuverType == "esriDMTSharpLeft") {
                        dhtml += "<img src='../img/zuohouzhuan.png'>" + feature.attributes.text + "距离" +
                            distance + "预计用时" + useTime + "<br>";
                    } else if (feature.attributes.maneuverType == "esriDMTSharpRight") {
                        dhtml += "<img src='../img/youhouzhuan.png'>" + feature.attributes.text + "距离" +
                            distance + "预计用时" + useTime + "<br>";
                    } else if (feature.attributes.maneuverType == "esriDMTTurnLeft" || feature.attributes
                        .maneuverType == "esriDMTBearLeft") {
                        dhtml += "<img src='../img/zuozhuan1.png'>" + feature.attributes.text + "距离" +
                            distance + "预计用时" + useTime + "<br>";
                    } else if (feature.attributes.maneuverType == "esriDMTBearRight") {
                        dhtml += "<img src='../img/xiangyouzhix.png'>" + feature.attributes.text + "距离" +
                            distance + "预计用时" + useTime + "<br>";
                    } else {
                        dhtml += "<img src='../img/likai.png'>" + feature.attributes.text + "<br>";
                    }

                    $('.list-group').append('<li class="list-group-item">  ' + dhtml + '</li>');
                    dhtml = "";

                    //返回 feature.attributes.text; 
                    console.log(feature.attributes);
                });

                var feaNum = directions.features.length;
                var totalPage = Math.ceil(feaNum / 5);
                $('.list-group').paginathing({
                    perPage: 5,
                    limitPagination: totalPage,
                    containerClass: 'panel-footer',
                    pageNumbers: true
                })

                $('.table tbody').paginathing({
                    perPage: 2,
                    insertAfter: '.table',
                    pageNumbers: true
                });

            });



            var msgs = ["服务器消息："];
            for (var i = 0; i < result.messages.length; i++) {
                msgs.push(result.messages[i].type + " : " + result.messages[i].description);
            }
            if (msgs.length > 1) {
                alert(msgs.join("\n - "));
            }
        },

        addSymbolclicks: function () {
            require(["dojo/_base/array"], function (array) {
                var dhtml = "";
                array.map(route.attributes, function (feature) {
                    var totalmeters = feature.attributes.Total_Meters;
                    var totalminutes = feature.attributes.Total_Minutes;
                    dhtml += "总距离" + totalmeters;
                });
                dojo.byId("direction").innerHTML = dhtml;

            });
        },

        //路径分析异常
        errorHandler: function (err) {
            alert("发生错误\n" + err.message + "\n" + err.details.join("\n"));
        }
    })
})