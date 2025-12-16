// Configuration globale
let map;
let vectorGrid;
let satelliteLayer;
let currentBaseLayer = 'osm';
let layerCheckboxes = {};
const appConfig = {
    vectorLayers: [],
    tilesUrl: '',
    minZoom: 1,
    maxZoom: 13
};

// Styles prédéfinis pour chaque couche
const layerStyles = {
    'plantation_forestiere': {
        fillColor: '#228B22',
        color: '#006400',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'foret_marecageuse': {
        fillColor: '#2E8B57',
        color: '#1a4f2c',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'plan_cours_eau': {
        fillColor: '#1E90FF',
        color: '#0064c8',
        weight: 2,
        fillOpacity: 0.5,
        opacity: 0.7
    },
    'plantation_anacarde': {
        fillColor: '#FFD700',
        color: '#b39700',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'mangrove': {
        fillColor: '#006400',
        color: '#003200',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'savane_arboree': {
        fillColor: '#90EE90',
        color: '#5ec85e',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'amenaegement_agricole': {
        fillColor: '#DEB887',
        color: '#b88a57',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'plantation_palmier_hulle': {
        fillColor: '#8B4513',
        color: '#5d2f0d',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'zone_marecageuse': {
        fillColor: '#20B2AA',
        color: '#147f79',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'sol_nu': {
        fillColor: '#D2B48C',
        color: '#b89468',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'formations_herbacees': {
        fillColor: '#9ACD32',
        color: '#7aad19',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'foret_degradee': {
        fillColor: '#A52A2A',
        color: '#751e1e',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'formations_arbustives': {
        fillColor: '#32CD32',
        color: '#25a025',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'plantation_cacao': {
        fillColor: '#8B7355',
        color: '#6d5a44',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'plantation_hevea': {
        fillColor: '#2F4F4F',
        color: '#1e3232',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'affleurement_rocheux': {
        fillColor: '#696969',
        color: '#4a4a4a',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'plantation_cafe': {
        fillColor: '#8B4513',
        color: '#5d2f0d',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'plantation_fruitiere': {
        fillColor: '#FF6347',
        color: '#e63a1f',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'foret_claire': {
        fillColor: '#88e08eff',
        color: '#88e08eff',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'foret_galerie': {
        fillColor: '#b2deb5ff',
        color: '#b2deb5ff',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'plantation_coco': {
        fillColor: '#39aeb6ff',
        color: '#39aeb6ff',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'foret_dense': {
        fillColor: '#105b06ff',
        color: '#105b06ff',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
    'v_ml_dk_plantations': {
        fillColor: '#470050c0',
        color: '#470050c0',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    },
};

// Initialisation de l'application
async function initializeApp() {
    try {
        await loadTilesConfig();
        initializeMap();
        initializeVectorTiles();
        initializeUI();
        setupEventListeners();
        setupSelectAllCheckbox();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        showError('Erreur de chargement des données');
    }
}

// Charger la configuration du tiles.json
async function loadTilesConfig() {
    const response = await fetch('https://api.maptiler.com/tiles/0199883e-7a16-79bf-99a3-08783aeac961/tiles.json?key=KtvCTMS0ZHPNWOUZcUus');
    const tilesConfig = await response.json();
    
    appConfig.vectorLayers = tilesConfig.vector_layers || [];
    appConfig.tilesUrl = tilesConfig.tiles ? tilesConfig.tiles[0] : '';
    appConfig.minZoom = tilesConfig.minzoom || 1;
    appConfig.maxZoom = tilesConfig.maxzoom || 13;

    const response2 = await fetch('https://api.maptiler.com/tiles/01987ad8-daa5-7eb8-be5c-07864b291159/tiles.json?key=KtvCTMS0ZHPNWOUZcUus');
    const tilesConfig2 = await response2.json();
    console.log(tilesConfig2);
    appConfig.vectorLayers.push(tilesConfig2.vector_layers[0]);
    
    console.log('Configuration chargée:', appConfig);
}

// Initialiser la carte Leaflet
function initializeMap() {
    map = L.map('map', {
        minZoom: appConfig.minZoom,
        maxZoom: appConfig.maxZoom
    }).setView([7.5399, -5.5471], 8);
    

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    

    satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, DigitalGlobe, Earthstar Geographics'
    });
    

    const baseLayers = {
        "Carte Standard": osmLayer,
    };
    
    L.control.layers(baseLayers).addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
}

// Initialiser les tuiles vectorielles
function initializeVectorTiles() {
    if (!appConfig.tilesUrl) {
        throw new Error('URL des tuiles non disponible');
    }

    const vectorTileLayerStyles = {};
    
    appConfig.vectorLayers.forEach(layer => {
        vectorTileLayerStyles[layer.id] = layerStyles[layer.id] || getDefaultStyle();
    });

    vectorGrid = L.vectorGrid.protobuf(appConfig.tilesUrl, {
        vectorTileLayerStyles: vectorTileLayerStyles,
        interactive: true,
        getFeatureId: function(feature) {
            return feature.properties?.OBJECTID || feature.id;
        },
        maxNativeZoom: appConfig.maxZoom,
        minNativeZoom: appConfig.minZoom
    }).addTo(map);
    

    vectorGrid.on('click', function(e) {
        const layer = e.layer;
        const properties = e.layer.properties;
        const layerId = e.layer._vectorTileLayer?.name || 'unknown';
        
        showFeatureInfo(properties, layerId);
        

        highlightFeature(layer);
    });
    
    vectorGrid.on('mouseover', function(e) {
        map.getContainer().style.cursor = 'pointer';
    });
    
    vectorGrid.on('mouseout', function(e) {
        map.getContainer().style.cursor = '';
    });
}

function setupSelectAllCheckbox(){
    const selectAllCheckbox = document.getElementById('select-all-layers');
    const layerControls = document.querySelectorAll('.layer-control:not(#select-all-layers)');
    
    selectAllCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        var i= 0;
        layerControls.forEach(checkbox => {
            i++;
            if (checkbox.checked !== isChecked) {
                checkbox.checked = isChecked;
               
                const layerId = checkbox.dataset.layerId;
                console.log(layerId)
                if(i === layerControls.length){
                    toggleVectorLayer(layerId, isChecked);
                }else{
                    toggleVectorLayer(layerId, isChecked);
                }
                
            }
            
        });
        vectorGrid.redraw();
    });

    layerControls.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const allChecked = Array.from(layerControls).every(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = !allChecked && 
                Array.from(layerControls).some(cb => cb.checked);
        });
    });
    vectorGrid.redraw();
}

// Afficher les informations de l'élément cliqué
function showFeatureInfo(properties, layerId) {
    const infoPanel = document.getElementById('feature-info');
    const layerName = formatLayerName(layerId);
    
    let html = `
        <div class="feature-header">
            <h4>${layerName}</h4>
            <div class="layer-id">ID: ${layerId}</div>
        </div>
        <div class="feature-properties">
    `;
    
    if (properties && Object.keys(properties).length > 0) {
        Object.keys(properties).forEach(key => {
            const value = properties[key];
            if (value !== null && value !== undefined && value !== '') {
                html += `
                    <div class="feature-property">
                        <span class="property-key">${formatPropertyName(key)}:</span>
                        <span class="property-value">${value}</span>
                    </div>
                `;
            }
        });
    } else {
        html += `<div class="no-properties">Aucune propriété disponible</div>`;
    }
    
    html += `</div>`;
    infoPanel.innerHTML = html;
}

// Surligner temporairement l'élément cliqué
function highlightFeature(layer) {
    if (window.currentHighlight) {
        vectorGrid.resetStyle(window.currentHighlight);
    }
    const originalStyle = layer.options;
    layer.setStyle({
        weight: 3,
        color: '#FF0000',
        fillOpacity: 0.9,
        opacity: 1
    });
    

    window.currentHighlight = layer;
   
    setTimeout(() => {
        if (window.currentHighlight) {
            //vectorGrid.resetStyle(window.currentHighlight);
            vectorGrid.resetFeatureStyle(window.currentHighlight);
            window.currentHighlight = null;
        }
    }, 3000);
}

// Initialiser l'interface utilisateur
function initializeUI() {
    const controlsContainer = document.getElementById('layer-controls');
    controlsContainer.innerHTML = ''; 
    
    if (appConfig.vectorLayers.length === 0) {
        controlsContainer.innerHTML = '<div class="error">Aucune couche disponible</div>';
        return;
    }
    
    appConfig.vectorLayers.forEach(layer => {
        const layerItem = createLayerControl(layer);
        controlsContainer.appendChild(layerItem);
    });
}

// Créer un contrôle de couche
function createLayerControl(layer) {
    const layerItem = document.createElement('div');
    layerItem.className = 'layer-item';
    layerItem.innerHTML = `
        <div class="layer-color" style="background-color: ${layerStyles[layer.id]?.fillColor || '#CCCCCC'}"></div>
        <input type="checkbox" data-layer-id="${layer.id}" class="layer-control" id="layer-${layer.id}" checked>
        <label for="layer-${layer.id}" class="layer-label">
            ${formatLayerName(layer.id)}
            <span class="layer-stats">(${layer.fields ? Object.keys(layer.fields).length : 0} champs)</span>
        </label>
        <div class="layer-actions">
            <button class="action-btn info-btn" title="Informations">ⓘ</button>
        </div>
    `;
    
    const checkbox = layerItem.querySelector('input');
    checkbox.addEventListener('change', function() {
        toggleVectorLayer(layer.id, this.checked, true);
    });
    
    const infoBtn = layerItem.querySelector('.info-btn');
    infoBtn.addEventListener('click', function() {
        showLayerDetails(layer);
    });
    
    return layerItem;
}


function toggleVectorLayer(layerId, visible, redraw=false) {
    if (vectorGrid && vectorGrid.options.vectorTileLayerStyles) {
        const currentStyle = vectorGrid.options.vectorTileLayerStyles[layerId];
        if (currentStyle) {
            vectorGrid.options.vectorTileLayerStyles[layerId] = {
                ...currentStyle,
                fillOpacity: visible ? 0.7 : 0,
                opacity: visible ? 0.8 : 0
            };
            if(redraw){
                vectorGrid.redraw();
            }
        }
    }
}

// Afficher les détails d'une couche
function showLayerDetails(layer) {
    const infoPanel = document.getElementById('feature-info');
    let html = `
        <div class="feature-header">
            <h4>Détails de la couche</h4>
            <div class="layer-id">${layer.id}</div>
        </div>
        <div class="layer-details">
            <div class="detail-item">
                <strong>Nom:</strong> ${formatLayerName(layer.id)}
            </div>
            <div class="detail-item">
                <strong>Zoom min:</strong> ${layer.minzoom || appConfig.minZoom}
            </div>
            <div class="detail-item">
                <strong>Zoom max:</strong> ${layer.maxzoom || appConfig.maxZoom}
            </div>
    `;
    
    if (layer.fields && Object.keys(layer.fields).length > 0) {
        html += `<div class="detail-item">
            <strong>Champs:</strong>
            <div class="fields-list">`;
        
        Object.keys(layer.fields).forEach(field => {
            html += `<div class="field-item">• ${field}: ${layer.fields[field]}</div>`;
        });
        
        html += `</div></div>`;
    }
    
    html += `</div>`;
    infoPanel.innerHTML = html;
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        this.classList.toggle('active');
        
        // Changer l'icône
        if (sidebar.classList.contains('collapsed')) {
            this.textContent = '☰';
        } else {
            this.textContent = '✕';
        }
    });

    map.on('mousemove', function(e) {
        document.getElementById('coordinates').textContent = 
            `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`;
    });
    

    map.on('zoomend', function() {
        document.getElementById('zoom-level').textContent = 
            `Zoom: ${map.getZoom()}`;
    });
}

// Basculer la vue satellite
function toggleSatelliteView() {
    if (currentBaseLayer === 'osm') {
        map.removeLayer(map._layers[Object.keys(map._layers)[0]]);
        satelliteLayer.addTo(map);
        currentBaseLayer = 'satellite';
    } else {
        map.removeLayer(satelliteLayer);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        currentBaseLayer = 'osm';
    }
}

// Helper: Style par défaut
function getDefaultStyle() {
    return {
        fillColor: '#CCCCCC',
        color: '#999999',
        weight: 1,
        fillOpacity: 0.7,
        opacity: 0.8
    };
}

// Helper: Formater le nom de la couche
function formatLayerName(layerId) {
    const names = {
        'plantation_forestiere': 'Plantation Forestière',
        'foret_marecageuse': 'Forêt Marécageuse',
        'plan_cours_eau': 'Cours d\'Eau',
        'plantation_anacarde': 'Plantation Anacarde',
        'mangrove': 'Mangrove',
        'savane_arboree': 'Savane Arborée',
        'amenaegement_agricole': 'Aménagement Agricole',
        'plantation_palmier_hulle': 'Palmier à Huile',
        'zone_marecageuse': 'Zone Marécageuse',
        'sol_nu': 'Sol Nu',
        'formations_herbacees': 'Formations Herbacées',
        'foret_degradee': 'Forêt Dégradée',
        'formations_arbustives': 'Formations Arbustives',
        'plantation_cacao': 'Plantation Cacao',
        'plantation_hevea': 'Plantation Hévéa',
        'affleurement_rocheux': 'Affleurement Rocheux',
        'plantation_cafe': 'Plantation Café',
        'plantation_fruitiere': 'Plantation Fruitière'
    };
    
    return names[layerId] || layerId.replace(/_/g, ' ');
}

// Helper: Formater le nom des propriétés
function formatPropertyName(property) {
    const names = {
        'OBJECTID': 'ID Objet',
        'gridcode': 'Code Grille',
        'id': 'ID'
    };
    
    return names[property] || property;
}

// Helper: Afficher une erreur
function showError(message) {
    const infoPanel = document.getElementById('feature-info');
    infoPanel.innerHTML = `<div class="error">${message}</div>`;
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', initializeApp);