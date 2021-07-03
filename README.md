# maptest

#### 网页主题
2019年湖北各市州GDP专题图

#### 网页地址
https://loveyourwmx.github.io/maptest/

#### 目录结构描述
    1. ├── ChinaProvince.geojson     // 中国省级行政区划 geojson文件  
    2. ├── README.md                 // 帮助文件    
    3. ├── arcgisAPI.js              // 网页脚本 js文件  
    4. ├── echarts.js                // echarts引用 js文件  
    5. ├── hubei_gdp.geojson         // 湖北市州级行政区划（含2010-2019年GDP数据）geojson文件  
    6. ├── index.html                // 网页主体 html文件  
    7. └── mapStyle.css              // 网页引用样式 css文件  
 

#### V1.0.0 版本内容更新
1. 图层管理：
    - 根据名字切换地图。
    - 动态加载专题图层，控制图层的显示、关闭与删除。
    - 拖动图层控制图层层级。
    - 双击图层跳转到图层所在位置。
    - 通过网址加载地图（只支持MapServer、FeatureServer以及GeoJSON）。
    - 缩小菜单
2. 分级设色：
    - 只支持对hubei_gdp图层操作。
    - 可以选择字段（gdp_2010 ~ gdp_2019）。
    - 能够选择分类方式和分类级别。
    - 支持手工分类，会弹出手工分类工具栏。
3. 图例：
    - 显示分级设色情况。
    - 显示图层要素样式。
4. 卷帘：
    - 能够横轴拖动改变卷帘范围。
5. 交互：
    - 鼠标滑动高亮显示要素。
    - 点击要素弹窗展示地区gdp构成，可以切换图表。
    - 图表展示2010-2019年湖北地区生产总值。
6. 状态栏：
    - 显示鼠标所在经纬度。
    - 显示地图比例尺。
    - 显示图层数量。
7. 动态小窗：
    - 小窗动态同步显示地图可见区域。




