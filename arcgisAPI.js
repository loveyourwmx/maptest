var map;
var view_;
var littleView;
var featureOption = {
    changjiang: {
        option: {
            id: "changjiang",
            url: "https://services9.arcgis.com/S990USlhfgpUmWKm/arcgis/rest/services/changjiang/FeatureServer",
        },
        server: "FeatureServer",
        tileFlag: false,
        initialExtent: {
            xmin: -3037599.343942944,
            ymin: 4366604.6438195035,
            xmax: 2786474.0838934779,
            ymax: 6186627.590018386,
            spatialReference: {
                wkid: 32649,
                latestWkid: 32649,
            },
        },
    },
    ChinaProvince: {
        option: {
            id: "ChinaProvince",
            url: "https://services9.arcgis.com/S990USlhfgpUmWKm/arcgis/rest/services/ChinaProvince/FeatureServer",
        },
        server: "FeatureServer",
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

    require(["esri/config",
            "esri/Map",
            "esri/views/MapView",
            "esri/core/watchUtils",
            "esri/layers/FeatureLayer",],
        function (esriConfig,
                  Map,
                  MapView,
                  watchUtils,
                  FeatureLayer) {
            esriConfig.apiKey = "AAPK87d785a361d643a0960d805527ac5c81MDi0mPJjwFhfBzjlnwvVxaBzh-ZSQNQN0JI7XrVBGg56mf-_VlnG1jUNfKc6UlQz";

            // checkCookie();
            map = new Map({
                basemap: $('input[name=optradio]:checked').val() // Basemap layer service
            });
            const mask_map = new Map({
                basemap: "arcgis-community" // Basemap layer service
            });
            view_ = new MapView({
                map: map,
                center: [106, 38], // Longitude, latitude
                zoom: 4, // Zoom level
                container: "viewDiv" // Div element
            });
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

function AddLayer2Map(layerID) {
    let q = 'input[title=' + layerID + ']';

    if ($(q).length === 0) {
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
        let Foption = featureOption[layerID];
        focus2Map(layerID);
        if (Foption.server === "MapServer") {
            if (Foption.tileFlag) {
                require(["esri/layers/TileLayer"], (TileLayer) => {
                    let Flayer = new TileLayer(Foption.option);
                    let index = $("#featurebox").children().length - $(q).parent().index();
                    map.add(Flayer, index);
                })
            } else {
                require(["esri/layers/MapImageLayer"], (MapImageLayer) => {
                    let Flayer = new MapImageLayer(Foption.option);
                    let index = $("#featurebox").children().length - $(q).parent().index();
                    map.add(Flayer, index);
                })
            }
        } else {
            require(["esri/layers/FeatureLayer"], (FeatureLayer) => {
                let Flayer = new FeatureLayer(Foption.option);
                let index = $("#featurebox").children().length - $(q).parent().index();
                map.add(Flayer, index);
            })
        }
        // console.log(view_.extend)
        // view_.extend = featureOption[layerID].initialExtent;
        // console.log(view_.extend)
        // require(["esri/geometry/Extent"], function(Extent) {
        //     let ext = featureOption[layerID].initialExtent
        //     view_.extend = new Extent(featureOption[layerID].initialExtent);
        // });

    } else {
        alert("请勿重复添加！")
    }
}

function AddLayer2List() {
    let url = $("#layerUrl").val();
    if (url.length !== 0) {
        let urlArr = url.split("/")
        let server = urlArr.pop();
        if (server !== "MapServer" && server !== "FeatureServer") {
            server = urlArr.pop();
        }
        if (server !== "MapServer" && server !== "FeatureServer") {
            alert("请输入正确服务地址！")
        } else {
            url = urlArr.toString().replace(/,/g, "/") + "/" + server
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
                    let type;
                    let tileFlag = false;
                    if (server === "MapServer") {
                        type = "image";
                        if (data.tileInfo) {
                            type = "tile";
                            tileFlag = true;
                        }
                    }
                    if (server === "FeatureServer") {
                        type = data.layers[0].geometryType;
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
                        initialExtent: data.initialExtent,
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
    focus2Map(layerID)
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