const changeMarkers = () => {
  console.log('Changing spot markers.');
  markerCluster.clearMarkers();
  marker.forEach(marker => {
    new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: marker.getPosition(),
        radius: 500
    });
  });
};

const showApartWithParkingNum = async () => {
  try {
    console.log('Loading apart list.');
    const response = await fetch("https://cassy1003.github.io/public/ev_map/apart_list.csv");
    const text = await response.text();
    const rows = text.split('\n');

    console.log('Show Markers.')
    rows.forEach((row, idx) => {
      if (idx == 0) return;

      const columns = row.split(',');
      const address = columns[3];
      const name = columns[4];
      const roomsText = toHalfWidth(columns[11]);
      const parkingsText = toHalfWidth(columns[18]);
      const m = parkingsText.match(/\d+/g);
      const parkingsNum = m ? m.reduce((acc, num) => acc + parseInt(num, 10), 0) : '';

      geocodeAddress({
        address: address,
        name: name,
        roomsText: roomsText,
        parkingsNum: parkingsNum,
        parkingsText: parkingsText
      });
    });
  } catch (error) {
    console.error('Error fetching the CSV file:', error);
  }
}

const geocodeAddress = (info) => {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: info.address }, (results, status) => {
    if (status === 'OK') {
      const icon = createCustomMarker(info.parkingsNum);
      const marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location,
        icon: icon,
        title: `${info.name} - 駐車場: ${info.parkingsText}`
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div><strong>${info.name}</strong><br>[住所] ${info.address}<br>[戸数] ${info.roomsText}<br>[駐車場] ${info.parkingsText}</div>`
      });

      marker.addListener('click', () => {
        if (currentInfoWindow) currentInfoWindow.close();
        infoWindow.open(map, marker);
        currentInfoWindow = infoWindow;
      });
    } else {
      console.error('Geocode was not successful for the following reason: ' + status);
    }
  });
}

const createCustomMarker = (text) => {
  const svg = `
    <svg width="40" height="60" viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C12.27 0 6 6.27 6 14c0 10.14 14 24.77 14 33.5S20 54.64 20 47.5 34 24.14 34 14c0-7.73-6.27-14-14-14z" fill="blue" fill-opacity="0.5" />
      <text x="20" y="22" text-anchor="middle" fill="white" font-size="14" font-family="Arial" font-weight="bold">${text}</text>
    </svg>
  `;
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(40, 60),
    anchor: new google.maps.Point(20, 60)
  };
}

const toHalfWidth = (str) => {
  return str.replace(/[０-９]/g, function(char) {
    return String.fromCharCode(char.charCodeAt(0) - 0xFEE0);
  });
}

(() => {
  changeMarkers();
  showApartWithParkingNum();
})();