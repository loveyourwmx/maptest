var map;
var view_;
var littleView;
var featureOption = {
    hubei_gdp: {
        option: {
            id: "hubei_gdp",
            url: "https://loveyourwmx.github.io/maptest/hubei_gdp.geojson",
        },
        server: "GeoJSON",
        tileFlag: false,
        initialExtent: null,
    },
    river: {
        option: {
            id: "river",
            url: "https://services3.arcgis.com/U26uBjSD32d7xvm2/arcgis/rest/services/river/FeatureServer",
        },
        server: "FeatureServer",
        tileFlag: false,
        initialExtent: {
            xmin: -3077917.91125416,
            ymin: 3578146.00563437,
            xmax: 2826792.6512047,
            ymax: 6186794.25412366,
            spatialReference: {
                wkid: 32649,
                latestWkid: 32649,
            },
        },
    },
    ChinaProvince: {
        option: {
            id: "ChinaProvince",
            url: "https://loveyourwmx.github.io/maptest/ChinaProvince.geojson"
        },
        server: "GeoJSON",
        tileFlag: false,
        initialExtent: {
            xmin: -4565800.2844668543,
            ymin: 3581324.2627201993,
            xmax: 4047719.5394825833,
            ymax: 6273049.2077043988,
            spatialReference: {
                wkid: 32649,
                latestWkid: 32649,
            },
        },
    }
}

$(() => {
    let sbs = $(".sbs-divider");
    let featurebox = $("#featurebox");
    let rect = 'rect(0px,' + sbs.css("left") + ',' + sbs.height() + 'px,0px)';
    $("#maskDiv").css("clip", rect);

    featurebox.sortable({
        containment: "parent",
        cursor: "move"
    });
    featurebox.disableSelection();
    $("#layerMenu_btn").click(() => {
        $("#layerMenu").fadeToggle();
    })
    sbs.draggable({
        axis: "x",
        cursor: "w-resize",
        drag: () => {
            let rect = 'rect(0px,' + sbs.css("left") + ',' + sbs.height() + 'px,0px)';
            $("#maskDiv").css("clip", rect);
        }
    });

    $("#echart_btn").click(() => {
        $("#echart").fadeToggle();
    })
    var chartDom = document.getElementById('echart_hubei');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        xAxis: {
            type: 'category',
            name: '年份',
            data: ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']
        },
        yAxis: {
            type: 'value',
            name: "亿元",
        },
        series: [{
            label: {
                show: true,
                position: 'top'
            },
            data: [16226.94, 19942.45, 22590.89, 25378.01, 28242.13, 30344.00, 33353.00, 37235.00, 42021.95, 45828.31],
            type: 'bar',

        }]
    };

    option && myChart.setOption(option);


    require(["esri/config",
            "esri/Map",
            "esri/views/MapView",
            "esri/core/watchUtils",
            "esri/layers/GeoJSONLayer",
            "esri/smartMapping/renderers/color",
            "esri/smartMapping/statistics/histogram",
            "esri/widgets/smartMapping/ClassedColorSlider",
            "esri/widgets/Legend"],
        function (esriConfig,
                  Map,
                  MapView,
                  watchUtils,
                  GeoJSONLayer,
                  colorRendererCreator,
                  histogram,
                  ClassedColorSlider,
                  Legend,) {
            esriConfig.apiKey = "AAPK87d785a361d643a0960d805527ac5c81MDi0mPJjwFhfBzjlnwvVxaBzh-ZSQNQN0JI7XrVBGg56mf-_VlnG1jUNfKc6UlQz";

            // checkCookie();
            map = new Map({
                basemap: $('input[name=optradio]:checked').val() // Basemap geoJSONLayer service
            });
            const mask_map = new Map({
                basemap: "satellite" // Basemap geoJSONLayer service
            });

            view_ = new MapView({
                map: map,
                center: [113, 31], // Longitude, latitude
                zoom: 6, // Zoom level
                container: "viewDiv" // Div element
            });
            view_.ui.add(
                new Legend({
                    view: view_
                }),
                "bottom-left"
            );
            view_.ui.add("layerMenu_btn");
            view_.ui.add("echart_btn");
            view_.ui.add("layerMenu");
            view_.ui.add("echart");
            view_.ui.add("infoDiv");
            view_.ui.add("scaleStatus");
            view_.ui.add("Add_Panel");
            view_.ui.add("maskDiv");
            view_.ui.add("sbs_divider");

            const mask_view = new MapView({
                map: mask_map,
                center: [106, 38], // Longitude, latitude
                zoom: 4, // Zoom level
                container: "maskDiv" // Div element
            })
            mask_view.when(toggleSDS());

            littleView = new MapView({
                map: map,
                center: [106, 38], // Longitude, latitude
                zoom: 1,
                container: "littleView" // Div element
            });
            littleView.ui.components = [];

            const sync_littleView2view_ = () => {
                const views_1 = [view_, littleView];
                let active;

                const sync = (source) => {
                    if (!active || !active.viewpoint || active !== source) {
                        return;
                    }
                    for (const view of views_1) {
                        if (view !== active) {
                            // view_.viewpoint = active.viewpoint;
                            if (view.scale > active.scale) {
                                view.center = active.center;
                                view.zoom = view_.zoom - 3;
                                // view.goTo({
                                //     center: active.center,
                                //     zoom: view_.zoom - 3,
                                // });
                            } else {
                                view.center = active.center;
                                view.zoom = littleView.zoom + 3;
                                // view.goTo({
                                //     center: active.center,
                                //     zoom: littleView.zoom + 3,
                                // });
                            }

                        }
                    }
                };
                for (const view of views_1) {
                    view.watch("interacting", () => {
                        active = view;
                        sync(active);
                    });

                    view.watch("viewpoint", () => sync(view));
                }
            };
            sync_littleView2view_();

            const sync_mask2view_ = () => {
                const views = [view_, mask_view];
                let active;

                const sync = (source) => {
                    if (!active || !active.viewpoint || active !== source) {
                        return;
                    }

                    for (const view of views) {
                        if (view !== active) {
                            view.viewpoint = active.viewpoint;
                        }
                    }
                };

                for (const view of views) {
                    view.watch(["interacting", "animation"], () => {
                        active = view;
                        sync(active);
                    });

                    view.watch("viewpoint", () => sync(view));
                }
            };
            sync_mask2view_();


            let fieldSelect, classSelect, numClassesInput, slider;
            let fields = ["gdp_2010", "gdp_2011", "gdp_2012", "gdp_2013", "gdp_2014", "gdp_2015", "gdp_2016", "gdp_2017", "gdp_2018", "gdp_2019"];
            const geoJSONLayer = new GeoJSONLayer({
                title: "hubei_gdp",
                id:"hubei_gdp",
                url: "https://loveyourwmx.github.io/maptest/hubei_gdp.geojson",
                popupTemplate: {
                    // autocast as esri/PopupTemplate
                    title: "{市}",
                    content: [
                        {
                            title: "2019年" + "{市}" + "GDP构成（单位：亿元）",
                            type: "fields",
                            fieldInfos: [
                                {
                                    fieldName: "gdp_2019",
                                    label: "地区生产总值",
                                    format: {
                                        digitSeparator: true,
                                        places: 4
                                    }
                                },
                                {
                                    fieldName: "第一产业",
                                    label: "第一产业",
                                    format: {
                                        digitSeparator: true,
                                        places: 4
                                    }
                                },
                                {
                                    fieldName: "第二产业",
                                    label: "第二产业",
                                    format: {
                                        digitSeparator: true,
                                        places: 4
                                    }
                                },
                                {
                                    fieldName: "第三产业",
                                    label: "第三产业",
                                    format: {
                                        digitSeparator: true,
                                        places: 4
                                    }
                                }
                            ]
                        },
                        {
                            type: "media",
                            activeMediaInfoIndex: 0,
                            mediaInfos: [{
                                type: "pie-chart",
                                value: {
                                    fields: ["第一产业", "第二产业", "第三产业"],
                                    normalizeField: null,
                                    tooltipField: ["第一产业", "第二产业", "第三产业"],
                                }
                            }, {
                                title: "2010-2019年" + "{市}" + "GDP",
                                caption: "单位：亿元",
                                type: "column-chart", // autocasts as new PieChartMediaInfo
                                // Autocasts as new ChartMediaInfoValue object
                                value: {
                                    fields: fields,
                                    normalizeField: null,
                                    tooltipField: fields
                                }
                            }]
                        }]
                }
            });

            geoJSONLayer.when(function () {
                $("#echart").fadeToggle();
            }, function(error){
                alert( "图层初始化失败！请刷新网页或稍后再试！\n")
            });

            view_.when().then(function () {
                fieldSelect = document.getElementById("field-select");
                fieldSelect.addEventListener("change", generateRenderer);

                classSelect = document.getElementById("class-select");
                classSelect.addEventListener("change", generateRenderer);

                numClassesInput = document.getElementById("num-classes");
                numClassesInput.addEventListener("change", generateRenderer);

                watchUtils.whenFalseOnce(view_, "updating", generateRenderer);
            });

            // Generate rounded arcade expression when user
            // selects a field name
            function getValueExpression(field) {
                return "$feature." + field;
            }

            function generateRenderer() {
                const fieldLabel = fieldSelect.options[fieldSelect.selectedIndex].text;
                // default to natural-breaks when manual is selected for classification method
                const classificationMethod = classSelect.value === "manual" ? "natural-breaks" : classSelect.value;

                const params = {
                    layer: geoJSONLayer,
                    valueExpression: getValueExpression(fieldSelect.value),
                    view: view_,
                    classificationMethod: classificationMethod,
                    numClasses: parseInt(numClassesInput.value),
                    legendOptions: {
                        title: "湖北省" + fieldLabel + "(亿元)"
                    }
                };

                // generate the renderer and set it on the geoJSONLayer
                colorRendererCreator.createClassBreaksRenderer(params).then(function (rendererResponse) {
                    geoJSONLayer.renderer = rendererResponse.renderer;

                    if (!map.layers.includes(geoJSONLayer)) {
                        let content = '<li class="list-group-item" ondblclick="focus2Layer(this)" > <input type="checkbox"' +
                            ' value=' + "hubei_gdp" +
                            ' title=' + "hubei_gdp" +
                            ' onclick="toggleLayer(this)"' +
                            ' checked="checked">' +
                            '&nbsp&nbsp' + "hubei_gdp" +
                            '<a href="#" style="float: right"  onclick="removeLayer(this)">' +
                            '<span class="glyphicon glyphicon-remove" style="color: rgb(81, 77, 60);"></span>' +
                            '</a> ' +
                            '</li>';

                        $("#featurebox").prepend(content);
                        // focus2Map(layerID);
                        view_.extent = geoJSONLayer.fullExtent;
                        littleView.extend = view_.extent;
                        map.add(geoJSONLayer);
                        Highlight(geoJSONLayer);
                    }

                    if (classSelect.value === "manual") {
                        // if manual is selected, then add or update
                        // a classed color slider to allow the user to
                        // construct manual class breaks
                        updateColorSlider(rendererResponse);
                    } else {
                        destroySlider();
                    }

                });
            }

            // If manual classification method is selected, then create
            // a classed color slider to allow user to manually modify
            // the class breaks starting with the generated renderer

            function updateColorSlider(rendererResult) {

                histogram({
                    layer: geoJSONLayer,
                    valueExpression: getValueExpression(fieldSelect.value),
                    view: view_,
                    numBins: 100
                }).then(function (histogramResult) {
                    if (!slider) {
                        const sliderContainer = document.createElement("div");
                        const container = document.createElement("div");
                        container.id = "containerDiv";
                        container.appendChild(sliderContainer);
                        view_.ui.add(container, "bottom-right");

                        slider = ClassedColorSlider.fromRendererResult(rendererResult, histogramResult);
                        slider.container = container;
                        slider.viewModel.precision = 1;

                        function changeEventHandler() {
                            const renderer = geoJSONLayer.renderer.clone();
                            renderer.classBreakInfos = slider.updateClassBreakInfos(renderer.classBreakInfos);
                            geoJSONLayer.renderer = renderer;
                        }

                        slider.on(["thumb-change", "thumb-drag", "min-change", "max-change"], changeEventHandler);
                    } else {
                        slider.updateFromRendererResult(rendererResult, histogramResult);
                    }
                });

            }

            function destroySlider() {
                if (slider) {
                    let container = document.getElementById("containerDiv");
                    view_.ui.remove(container);
                    slider.container = null;
                    slider = null;
                    container = null;
                }
            }

            view_.when(() => {
                $('#scale').text('1 / ' + view_.scale.toFixed(0));

            });

            view_.on('pointer-move', (e) => {
                let point = view_.toMap({x: e.x, y: e.y});
                $('#lat').text(point.latitude.toFixed(2));
                $('#lon').text(point.longitude.toFixed(2));
            });

            view_.on('mouse-wheel', () => {
                $('#scale').text('1 / ' + view_.scale.toFixed(0));
            });

            map.watch('layers.length', (newVal) => {
                $('#layercount').text(newVal);
            })

            // view_.watch("extent", () => {
            //     littleView.goTo({
            //         center: view_.center,
            //         zoom: view_.zoom - 3,
            //         // scale: view_.scale * Math.max(view_.width /
            //         //     littleView.width,
            //         //     view_.height / littleView.height)/2
            //     });
            // })

            featurebox.on("sortupdate", (e, ui) => {
                let children = featurebox.children();
                children.each((i) => {
                    let child = $(children[i]);
                    let index = children.length - child.index() - 1;
                    let re_layer = map.findLayerById(child[0].children[0].value);
                    map.reorder(re_layer, index);
                })

            });


        });

})

function Highlight(targetLayer) {
    require(["esri/layers/GraphicsLayer",
            'esri/Graphic'],
        function (GraphicsLayer,
                  Graphic) {
            view_.whenLayerView(targetLayer).then(() => {
                let highlightLayer = new GraphicsLayer({id: "testMapServer"});
                map.add(highlightLayer);

                let fillSymbol = {
                    type: 'simple-fill',
                    color: [30, 159, 255, 0],
                    style: 'solid',
                    outline: {
                        color: [0, 254, 254, 1],
                        width: 2
                    }
                };
                view_.on("pointer-move", function (event) {
                    view_.hitTest(event).then(function (response) {
                        highlightLayer.removeAll();
                        if (response.results.length) {
                            let grapics = response.results.filter(function (result) {
                                return result.graphic.layer === targetLayer;
                            })
                            if (grapics.length) {
                                map.add(highlightLayer);
                                let graphic = grapics[0].graphic
                                let geometry = graphic.geometry;
                                let highLightSingle = new Graphic(geometry, fillSymbol, null);
                                highlightLayer.add(highLightSingle);
                            } else {
                                highlightLayer.removeAll();
                            }
                        }else {
                            map.remove(highlightLayer);
                        }

                    });
                });
            })
        })
}

function AddLayer2Map(layerID) {
    let q = 'input[title=' + layerID + ']';
    let autolayer,index;
    if ($(q).length === 0) {
        let Foption = featureOption[layerID];
        if (Foption.server === "MapServer") {
            if (Foption.tileFlag) {
                require(["esri/layers/TileLayer"], (TileLayer) => {
                    autolayer = new TileLayer(Foption.option);
                    index = $("#featurebox").children().length - $(q).parent().index();
                    map.add(autolayer, index);
                })
            } else {
                require(["esri/layers/MapImageLayer"], (MapImageLayer) => {
                    autolayer = new MapImageLayer(Foption.option);
                    index = $("#featurebox").children().length - $(q).parent().index();
                    map.add(autolayer, index);
                })
            }
        } else if (Foption.server === "FeatureServer") {
            require(["esri/layers/FeatureLayer"], (FeatureLayer) => {
                autolayer = new FeatureLayer(Foption.option);
                index = $("#featurebox").children().length - $(q).parent().index();
                map.add(autolayer, index);
            })
        } else if (Foption.server === "GeoJSON") {
            require(["esri/layers/GeoJSONLayer"], (GeoJSONLayer) => {
                autolayer = new GeoJSONLayer(Foption.option);
                index = $("#featurebox").children().length - $(q).parent().index();
                map.add(autolayer, index);
            })
        } else {
            return alert("添加失败！")
        }
        autolayer.when(function () {
            let content = '<li class="list-group-item" ondblclick="focus2Layer(this)" > <input type="checkbox"' +
                ' value=' + layerID +
                ' title=' + layerID +
                ' onclick="toggleLayer(this)"' +
                ' checked="checked">' +
                '&nbsp&nbsp' + layerID +
                '<a href="#" style="float: right"  onclick="removeLayer(this)">' +
                '<span class="glyphicon glyphicon-remove" style="color: rgb(81, 77, 60);"></span>' +
                '</a> ' +
                '</li>';

            $("#featurebox").prepend(content);
            // focus2Map(layerID);
            view_.extent = autolayer.fullExtent;
            littleView.extend = autolayer.fullExtent;
        }, function (error) {
            return alert("添加失败！")
        });
    } else {
        alert("请勿重复添加！")
    }
}

function AddLayer2List() {
    let url = $("#layerUrl").val();
    if (url.length !== 0) {

        let urlArr = url.split(".");
        let server = urlArr.pop();
        if (server !== "geojson") {
            urlArr = url.split("/");
            server = urlArr.pop();
            if (server !== "MapServer" && server !== "FeatureServer") {
                server = urlArr.pop();
            }
        } else {
            server = "GeoJSON";
        }

        if (server !== "MapServer" && server !== "FeatureServer" && server !== "GeoJSON") {
            alert("请输入正确服务地址！")
        } else {
            console.log(url)
            // url = urlArr.toString().replace(/,/g, "/") + "/" + server
            let name = urlArr.pop();
            if (document.getElementById(name)) {
                return alert("请勿重复添加！")
            }
            $.ajax({
                url: (url + '?f=pjson'),
                success: (result) => {
                    var data;
                    if (typeof (result) === "string") {
                        data = JSON.parse(result);
                    } else {
                        data = result;
                    }
                    let type, initialExtent;
                    let tileFlag = false;
                    if (server === "MapServer") {
                        type = "image";
                        initialExtent = data.initialExtent;
                        if (data.tileInfo) {
                            type = "tile";
                            tileFlag = true;
                        }
                    } else if (server === "FeatureServer") {
                        type = data.layers[0].geometryType;
                        initialExtent = data.initialExtent;
                    } else if (server === "GeoJSON") {
                        name = name.split("/").pop();
                        type = data.features[0].geometry.type;
                        initialExtent = null;
                    }
                    if (document.getElementById(name)) {
                        return alert("请勿重复添加！")
                    }
                    featureOption[name] = {
                        option: {
                            id: name,
                            url: url,
                        },
                        server: server,
                        tileFlag: tileFlag,
                        initialExtent: initialExtent,
                    }

                    let content = '<tr>\n' +
                        '                <td>' +
                        name +
                        '</td>\n' +
                        '                <td>' +
                        server +
                        '</td>\n' +
                        '                <td>' +
                        type +
                        '</td>\n' +
                        '                <td>\n' +
                        '                    <a type="button" class="btn" id=' +
                        name +
                        ' onclick="AddLayer2Map(this.id)">\n' +
                        '                        <span class="glyphicon glyphicon-plus"></span>\n' +
                        '                    </a>\n' +
                        '                </td>\n' +
                        '            </tr>'
                    $("#Add_Panel table>tbody").append(content);
                },
                error: (err) => {
                    alert("请求失败！");
                }
            });
        }

    }
}


function toggleLayer(e) {
    map.findLayerById(e.value).visible = e.checked;
}

function removeLayer(e) {
    let layerID = $(e).prev()[0].value;
    map.remove(map.findLayerById(layerID));
    $(e).parent().remove();
}

function toggleAddPanel() {
    $("#Add_Panel").toggle();
}

function toggleSDS() {
    $("#maskDiv").toggle();
    $(".sbs-divider").toggle();
}

function changeBaseMap(mapID) {
    map.basemap = mapID;
}

function focus2Layer(e) {
    let layerID = $(e).children()[0].value;
    let layer = map.findLayerById(layerID)
    view_.extent = layer.fullExtent;
    littleView.extend = layer.fullExtent;
    // focus2Map(layerID);
}

function focus2Map(layerID) {
    let Foption = featureOption[layerID];
    let extent = Foption.initialExtent;
    let center = {
        x: (parseFloat(extent.xmax) + parseFloat(extent.xmin)) / 2,
        y: (parseFloat(extent.ymax) + parseFloat(extent.ymin)) / 2,
        spatialReference: extent.spatialReference
    };
    require(["esri/geometry/projection"], function (projection) {
        projection.load().then(() => {
            center = projection.project(center, b = v = e = view_.spatialReference)
            view_.goTo(center);
            littleView.goTo(center);
        });
    })
}

// function getCookie(cname) {
//     var name = cname + "=";
//     var ca = document.cookie.split(';');
//     for (var i = 0; i < ca.length; i++) {
//         var c = ca[i].trim();
//         if (c.indexOf(name) === 0) {
//             return c.substring(name.length, c.length);
//         }
//     }
//     return "";
// }
//
// function checkCookie() {
//     var check = getCookie("baseMap");
//     if (check !== "") {
//         $('input[value=check]').prop("checked",true)
//     }
//
// }
//
// window.onbeforeunload = function () {
//     var d = new Date();
//     d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
//     var expires = "expires=" + d.toGMTString();
//     document.cookie = 'baseMap' + "=" + $('input[value="arcgis-light-gray"]').val() + "; ";
//     document.cookie = expires;
// }
