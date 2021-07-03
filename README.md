# maptest

#### 主题
2019年湖北各市州GDP专题图

#### 环境依赖
node v0.10.28+
redIs ~

#### 部署步骤
1. 添加系统环境变量
    export $PORTAL_VERSION="production" // production, test, dev


2. npm install  //安装node运行环境

3. gulp build   //前端编译

4. 启动两个配置(已forever为例)
    eg: forever start app-service.js
        forever start logger-service.js


#### 目录结构描述
├── Readme.md                   // help
├── arcgisAPI.js                         // 应用
├── config                      // 配置
├── config                      // 配置
├── test
├── test-service.js
└── tools


.
    arcgisAPI.js
    arcgis_for_js.html
    ChinaProvince.geojson
    echarts.js
    hubei_gdp.geojson
    list.txt
    mapStyle.css
    
│  arcgisAPI.js  
│  arcgis_for_js.html  
│  echarts.js  
│  list.txt  
│  mapStyle.css  
│    
└── tools    



#### V1.0.0 版本内容更新
1. 新功能     aaaaaaaaa
2. 新功能     bbbbbbbbb
3. 新功能     ccccccccc
4. 新功能     ddddddddd
