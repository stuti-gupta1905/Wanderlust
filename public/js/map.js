mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: listing.geometry.coordinates,
  zoom: 8,
});

const el = document.createElement("div");
el.innerHTML = `<i class="fa-solid fa-map-pin"></i>`;

el.style.fontSize = "30px";
el.style.color = "red";
el.style.cursor = "pointer";

const marker = new mapboxgl.Marker({
  element: el,
  anchor: "bottom",
})
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h6>${listing.title}</h6><p>Exact location provided after booking</p>`,
    ),
  )
  .addTo(map);

