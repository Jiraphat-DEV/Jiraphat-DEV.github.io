document.addEventListener('DOMContentLoaded', () => {
    // Create map instance
    const map = L.map('map').setView([18.796143, 98.979263], 13); // Set default view to Thailand

    // Define bounds to restrict map view to Thailand
    const southWest = L.latLng(5.6108, 97.3434); // Southernmost and westernmost point of Thailand
    const northEast = L.latLng(20.4632, 105.6368); // Northernmost and easternmost point of Thailand
    const bounds = L.latLngBounds(southWest, northEast);

    // Set max bounds to prevent panning outside of Thailand
    map.setMaxBounds(bounds);
    map.on('drag', function () {
        map.panInsideBounds(bounds, { animate: false });
    });

    // Add base map layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add WMTS flood map layers
    const floodMapUrls = {
        '1day': 'https://disaster.gistda.or.th/api/1.0/documents/flood/1day/tms/{z}/{x}/{y}.png?api_key=doncs9sePomiJFpqYgHpTL0QJU2akbKCP5agvHkucK96YlEm7CTA3FCBxXReT9Dz',
        '7days': 'https://disaster.gistda.or.th/api/1.0/documents/flood/7days/tms/{z}/{x}/{y}.png?api_key=doncs9sePomiJFpqYgHpTL0QJU2akbKCP5agvHkucK96YlEm7CTA3FCBxXReT9Dz',
        '30days': 'https://disaster.gistda.or.th/api/1.0/documents/flood/30days/tms/{z}/{x}/{y}.png?api_key=doncs9sePomiJFpqYgHpTL0QJU2akbKCP5agvHkucK96YlEm7CTA3FCBxXReT9Dz'
    };

    let currentFloodLayer = L.tileLayer(floodMapUrls['1day'], {
        tileSize: 512,
        zoomOffset: -1,
        attribution: '&copy; <a href="https://gistda.or.th">GISTDA</a> contributors'
    }).addTo(map);

    // Event listener for flood map selector
    document.getElementById('floodMapSelector').addEventListener('change', (event) => {
        // Remove current flood layer
        map.removeLayer(currentFloodLayer);

        // Add new flood layer based on the selected option
        const selectedPeriod = event.target.value;
        currentFloodLayer = L.tileLayer(floodMapUrls[selectedPeriod], {
            tileSize: 512,
            zoomOffset: -1,
            attribution: '&copy; <a href="https://gistda.or.th">GISTDA</a> contributors'
        }).addTo(map);
    });

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
                    <br><button class="remove-pin" data-lat="${house.lat}" data-lon="${house.lon}">ลบหมุด</button>
                `;

                // Bind popup with the content
                marker.bindPopup(popupContent);
            });
        }
    });

    // Variables for adding new pin
    let newPinLatLng = null;

    // Show the pin form when clicking on the map
    map.on('click', (e) => {
        newPinLatLng = e.latlng; // Save the clicked position
        document.getElementById('pinForm').style.display = 'block'; // Show form
    });

    // Add event listener for form submission (save pin)
    document.getElementById('savePin').addEventListener('click', () => {
        const pinName = document.getElementById('pinName').value;
        const pinDesc = document.getElementById('pinDesc').value;

        if (newPinLatLng) {
            // Create new marker with the input data
            const newMarker = L.marker(newPinLatLng).addTo(map);
            newMarker.bindPopup(`
                <b>${pinName}</b><br>${pinDesc}
                <a href="https://www.google.co.th/maps/dir//${newPinLatLng.lat},${newPinLatLng.lng}/">Direction to ${pinName}</a>
                <br><button class="remove-pin" data-lat="${newPinLatLng.lat}" data-lon="${newPinLatLng.lng}">ลบหมุด</button>
            `).openPopup();

            // Hide form after saving
            document.getElementById('pinForm').style.display = 'none';
            document.getElementById('pinName').value = '';
            document.getElementById('pinDesc').value = '';
            newPinLatLng = null;
        }
    });

    // Cancel adding pin
    document.getElementById('cancelPin').addEventListener('click', () => {
        // Hide form and clear input fields
        document.getElementById('pinForm').style.display = 'none';
        document.getElementById('pinName').value = '';
        document.getElementById('pinDesc').value = '';
        newPinLatLng = null;
    });

    // Event delegation to handle pin removal
    map.on('popupopen', function (e) {
        const removeButtons = document.querySelectorAll('.remove-pin');
        removeButtons.forEach(button => {
            button.addEventListener('click', function () {
                const lat = parseFloat(this.getAttribute('data-lat'));
                const lon = parseFloat(this.getAttribute('data-lon'));

                // Find and remove the marker
                map.eachLayer(function (layer) {
                    if (layer instanceof L.Marker) {
                        const layerLatLng = layer.getLatLng();
                        if (layerLatLng.lat === lat && layerLatLng.lng === lon) {
                            map.removeLayer(layer);
                        }
                    }
                });
            });
        });
    });
});
