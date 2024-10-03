// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    // Create map instance
    const map = L.map('map').setView([18.796143, 98.979263], 10); // Set default view to Thailand

    // Add OpenStreetMap base layer
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    

    // Add WMTS flood map layer from API
    // const floodMapUrl = 'https://disaster-vallaris.gistda.or.th/core/api/maps/1.0-beta/maps/66a0822867da3582878c0fd7/wmts/{z}/{x}/{y}.png?api_key=ErNGa8yrMWef0YutwmL7XvpwWQNCK2kVPNt5dAwWbBMnvDoifTEhD75H3DCENjKJ';
    const floodMapUrl = 'https://disaster.gistda.or.th/api/1.0/documents/flood/1day/tms/{z}/{x}/{y}.png?api_key=doncs9sePomiJFpqYgHpTL0QJU2akbKCP5agvHkucK96YlEm7CTA3FCBxXReT9Dz';
  
    L.tileLayer(floodMapUrl, {
        tileSize: 512,
        zoomOffset: -1,
        attribution: '&copy; <a href="https://gistda.or.th">GISTDA</a> contributors'
    }).addTo(map);

    // Custom icon for house marker
    const houseIcon = L.icon({
        iconUrl: './assets/location-icon.png', // Path to the house icon in the assets folder
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
        popupAnchor: [0, -32] // point from which the popup should open relative to the iconAnchor
    });

    // Load house data from CSV
    Papa.parse('./assets/houses.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const houses = results.data; // Array of house objects

            // Add markers for each house
            houses.forEach(house => {
                // Create marker for each house
                const marker = L.marker([house.lat, house.lon], { icon: houseIcon }).addTo(map);

                // Popup content with house position and text area for comments
                const popupContent = `
                    <b>House Name:</b> ${house.name}<br>
                    <b>Latitude:</b> ${house.lat}<br>
                    <b>Longitude:</b> ${house.lon}<br>
                    <a href="https://www.google.co.th/maps/dir//${house.lat},${house.lon}/">Direction to ${house.name}</a>
                `;

                // Bind popup with the content
                marker.bindPopup(popupContent);
            });
        }
    });
});
