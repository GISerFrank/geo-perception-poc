// --- Main execution function ---
async function main() {
    // 1. 填入你的 Cesium Ion Access Token
    Cesium.Ion.defaultAccessToken = config.cesiumToken;
    // 2. 填入你的 Google API Key
    const googleApiKey = config.googleApiKey;

    // 3. 初始化 Viewer
    const viewer = new Cesium.Viewer('cesiumContainer', {
      terrain: Cesium.Terrain.fromWorldTerrain(), 
      infoBox: false, 
      selectionIndicator: false, 
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
    });
    
    // 4. 加载 Google Photorealistic 3D Tiles
    try {
        const google3DTileset = await Cesium.createGooglePhotorealistic3DTileset({ key: googleApiKey });
        viewer.scene.primitives.add(google3DTileset);
    } catch (error) { console.error(`Failed to load Google 3D Tiles: ${error}`); }

    // 5. 获取UI元素
    const infoPanel = document.getElementById('info-panel');
    const infoDescription = document.getElementById('info-description');
    const infoImage = document.getElementById('info-image');
    const infoViews = document.getElementById('info-views');
    const infoAudio = document.getElementById('info-audio');
    const infoPerception = document.getElementById('info-perception');
    infoPanel.classList.add('hidden');

    // --- 辅助函数定义 (FIX: Moved before they are used) ---
    function createViewButtons(viewsData) {
        infoViews.innerHTML = '';
        if (Array.isArray(viewsData)) {
            viewsData.forEach(view => {
                const button = document.createElement('button');
                button.innerText = view.name;
                button.onclick = function() {
                    flyToView(view);
                };
                infoViews.appendChild(button);
            });
        }
    }

    function flyToView(view) {
        const position = view.position;
        const orientation = view.orientation;
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
            orientation: {
                heading: Cesium.Math.toRadians(orientation.heading),
                pitch: Cesium.Math.toRadians(orientation.pitch),
                roll: 0.0
            },
            duration: 2.5 
        });
    }

    // 6. 加载 GeoJSON 数据并创建标记点
    const geoJsonPromise = Cesium.GeoJsonDataSource.load('data/perception_data.geojson');
    geoJsonPromise.then(function(dataSource) {
      viewer.dataSources.add(dataSource);
      const entities = dataSource.entities.values;

      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        // ... (创建标记点的代码与上一版相同)
        entity.billboard = undefined;
        entity.point = undefined;
        entity.polyline = undefined;
        entity.ellipse = undefined;

        const floatingHeight = 25.0;
        const defaultCoreMaterial = Cesium.Color.fromCssColorString('#00a2ff').withAlpha(0.7);
        const highlightCoreMaterial = Cesium.Color.CYAN.withAlpha(0.9);
        const haloMaterial = Cesium.Color.CYAN.withAlpha(0.15);

        entity.ellipsoid = {
            radii: new Cesium.Cartesian3(7.0, 7.0, 7.0), 
            material: defaultCoreMaterial,
            height: floatingHeight,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        };
        entity.halo = new Cesium.EllipsoidGraphics({
            radii: new Cesium.Cartesian3(12.0, 12.0, 12.0),
            material: haloMaterial,
            height: floatingHeight,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            show: false 
        });
        entity.defaultMaterial = defaultCoreMaterial;
        entity.highlightMaterial = highlightCoreMaterial;
      }
      
      viewer.flyTo(dataSource);
    }).catch(function(error){ console.error("Error loading GeoJSON: ", error); });
    
    // --- 事件监听器 (现在可以安全地使用辅助函数了) ---

    // 7. Hover 事件监听器
    let highlightedEntity = null;
    const hoverHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    hoverHandler.setInputAction(function(movement) {
        const pickedObject = viewer.scene.pick(movement.endPosition);
        if (Cesium.defined(highlightedEntity)) {
            highlightedEntity.ellipsoid.material = highlightedEntity.defaultMaterial;
            if (highlightedEntity.halo) { highlightedEntity.halo.show = false; }
            highlightedEntity = null;
        }
        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.ellipsoid)) {
            highlightedEntity = pickedObject.id;
            highlightedEntity.ellipsoid.material = highlightedEntity.highlightMaterial;
            if (highlightedEntity.halo) { highlightedEntity.halo.show = true; }
        }
        viewer.canvas.style.cursor = Cesium.defined(highlightedEntity) ? 'pointer' : 'default';
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 8. Click 事件监听器
    const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    clickHandler.setInputAction(function(movement) {
      infoPanel.classList.add('hidden');
      const pickedObject = viewer.scene.pick(movement.position);
      
      if (!Cesium.defined(pickedObject)) { return; }

      if (pickedObject.id instanceof Cesium.Entity) {
          const entity = pickedObject.id;
          const properties = entity.properties;
          if (properties) {
            infoDescription.innerHTML = properties.description ? properties.description._value : 'Perception Point';
            infoImage.src = properties.image_url ? properties.image_url._value : '';
            infoImage.style.display = properties.image_url ? 'block' : 'none';
            infoAudio.src = properties.audio_url ? properties.audio_url._value : '';
            infoAudio.parentElement.style.display = properties.audio_url ? 'block' : 'none';
            const perceptionData = properties.perception ? properties.perception._value : null;
            let perceptionHTML = '';
            if (perceptionData) {
              perceptionHTML = '<h4>Perception Scores:</h4>';
              for (const key in perceptionData) { perceptionHTML += `<p><strong>${key}:</strong> ${perceptionData[key]}/10</p>`; }
            }
            infoPerception.innerHTML = perceptionHTML;
            const viewsData = properties.views ? properties.views._value : null;
            createViewButtons(viewsData); // <-- This call is now safe
            infoPanel.classList.remove('hidden');
          }
      } 
      else if (pickedObject.primitive instanceof Cesium.Cesium3DTileset) {
          const cartesian = viewer.scene.pickPosition(movement.position);
          if (Cesium.defined(cartesian)) {
              const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
              const longitude = Cesium.Math.toDegrees(cartographic.longitude);
              const latitude = Cesium.Math.toDegrees(cartographic.latitude);
              infoDescription.innerHTML = "Querying Building Info...";
              infoImage.style.display = 'none';
              infoAudio.parentElement.style.display = 'none';
              infoViews.innerHTML = '';
              infoPerception.innerHTML = `<p>Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}</p>`;
              infoPanel.classList.remove('hidden');
              const radius = 50;
              const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
              const placesUrl = `${proxyUrl}https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude}%2C${longitude}&radius=${radius}&key=${googleApiKey}`;
              fetch(placesUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        const place = data.results[0];
                        let buildingInfoHTML = '<h4>Nearby Place Information:</h4>';
                        buildingInfoHTML += `<p><strong>Name:</strong> ${place.name || 'N/A'}</p>`;
                        buildingInfoHTML += `<p><strong>Type:</strong> ${(place.types && place.types.join(', ')) || 'N/A'}</p>`;
                        buildingInfoHTML += `<p><strong>Address:</strong> ${place.vicinity || 'N/A'}</p>`;
                        buildingInfoHTML += `<p><strong>Rating:</strong> ${place.rating || 'N/A'} (${place.user_ratings_total || 0} reviews)</p>`;
                        infoPerception.innerHTML = buildingInfoHTML;
                    } else {
                        infoPerception.innerHTML += "<p>No nearby places found in the database.</p>";
                    }
                })
                .catch(error => {
                    console.error('Error fetching Places API data:', error);
                    infoPerception.innerHTML += "<p>Could not fetch place information.</p>";
                });
          }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //     clickHandler.setInputAction(function(movement) {
    //     console.log('Click detected');
    //     const pickedObject = viewer.scene.pick(movement.position);
    //     console.log('Picked:', pickedObject);
        
    //     if (pickedObject) {
    //         // 打印所有属性
    //         for (let key in pickedObject) {
    //             console.log(key + ':', pickedObject[key]);
    //         }
    //     }
    // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

// 运行主异步函数
main();