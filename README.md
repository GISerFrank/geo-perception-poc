# Cesium 3D Perception Map Visualization

## Overview

An interactive 3D map visualization application built with Cesium and Google Photorealistic 3D Tiles. This project overlays perception data points on realistic 3D city models, creating an immersive spatial information platform for urban perception analysis and visualization.

## Features

### 🌍 **3D Map Rendering**
- Integration with Google Photorealistic 3D Tiles for high-quality, real-world 3D building models
- Smooth camera navigation with flyTo animations
- Optimized rendering with request render mode for better performance
- World terrain support from Cesium Ion

### 📍 **Perception Data Points**
- Dynamic loading of custom perception points from GeoJSON files
- Interactive 3D sphere markers with customizable appearance
- Hover effects with glowing halo animation
- Click-to-reveal detailed information panels

### 🏢 **Building Information**
- Click on any building to retrieve location coordinates
- Google Places API integration for nearby place information
- Display of building names, types, addresses, and ratings
- Real-time querying of building metadata

### 🎭 **Rich Media Support**
- Image galleries for perception points
- Audio playback capabilities
- Custom viewpoint presets for optimal viewing angles
- Perception score visualization with rating scales

### 🎨 **User Interface**
- Responsive information panel with smooth transitions
- Hidden panel animations for clean interface
- Custom cursor feedback for interactive elements
- Dynamic content loading based on user interactions

## Technology Stack

- **Cesium.js 1.98** - 3D globe and map visualization framework
- **Google Photorealistic 3D Tiles** - Real-world 3D building data
- **Google Places API** - Location and place information
- **GeoJSON** - Geospatial data format for perception points
- **Vanilla JavaScript** - Core application logic
- **HTML5/CSS3** - User interface and styling

## Project Structure

```
cesium-perception-map/
│
├── index.html              # Main HTML file
├── script.js               # Core application logic
├── style.css              # Styling and animations
├── config.js              # API keys configuration (not in repo)
├── config.example.js      # API keys template
│
├── data/
│   └── perception_data.geojson   # Perception points data
│
├── assets/
│   ├── images/            # Point-specific images
│   └── audio/             # Point-specific audio files
│
└── README.md              # Project documentation
```

## Installation & Setup

### Prerequisites
- Modern web browser with WebGL support (Chrome, Firefox, Edge, Safari)
- Local web server (Python, Node.js, or any HTTP server)
- Cesium Ion account (free tier available)
- Google Cloud Platform account with Maps API enabled

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/cesium-perception-map.git
cd cesium-perception-map
```

### Step 2: Configure API Keys
1. Copy the configuration template:
```bash
cp config.example.js config.js
```

2. Edit `config.js` and add your API keys:
```javascript
const config = {
    cesiumToken: 'YOUR_CESIUM_ION_ACCESS_TOKEN',
    googleApiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
};
```

### Step 3: Obtain API Keys

#### Cesium Ion Token:
1. Sign up at [https://cesium.com/ion/](https://cesium.com/ion/)
2. Go to Access Tokens page
3. Create a new token or use the default token
4. Copy the token to your config file

#### Google Maps API Key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. (Optional) Restrict the key to your domain

### Step 4: Prepare Data

Create your perception data in GeoJSON format:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "properties": {
        "description": "Point description",
        "image_url": "path/to/image.jpg",
        "audio_url": "path/to/audio.mp3",
        "perception": {
          "visual": 8,
          "acoustic": 6,
          "thermal": 7
        },
        "views": [
          {
            "name": "Street View",
            "position": [lon, lat, height],
            "orientation": {
              "heading": 45,
              "pitch": -30
            }
          }
        ]
      }
    }
  ]
}
```

### Step 5: Run the Application

Using Python 3:
```bash
python -m http.server 8000
```

Using Node.js:
```bash
npx http-server -p 8000
```

Using Live Server (VS Code):
- Install Live Server extension
- Right-click on `index.html`
- Select "Open with Live Server"

### Step 6: Access the Application
Open your browser and navigate to:
```
http://localhost:8000
```

## Usage Guide

### Navigation Controls
- **Left Click + Drag** - Rotate view
- **Right Click + Drag** - Zoom in/out
- **Middle Click + Drag** - Pan
- **Mouse Wheel** - Zoom
- **Double Click** - Zoom to location

### Interacting with Data Points
1. **Hover** over blue spheres to see highlight effect
2. **Click** on spheres to open information panel
3. **Use view buttons** to jump to preset viewpoints
4. **Play audio** if available for the point

### Querying Buildings
1. **Click** on any 3D building
2. Wait for Places API to fetch information
3. View building details in the info panel