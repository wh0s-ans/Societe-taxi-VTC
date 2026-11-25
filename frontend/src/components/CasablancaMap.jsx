import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CASABLANCA_CENTER = [33.5731, -7.5898];

/* Création d'icônes vectorielles Leaflet sans dépendance aux PNG par défaut */
function creerIconeMarqueur(lettre, couleurFond) {
  return L.divIcon({
    className: 'vtc-custom-marker',
    html: `<div style="
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: ${couleurFond};
      border: 2.5px solid #ffffff;
      box-shadow: 0 3px 10px rgba(10, 15, 26, 0.28);
      display: flex;
      align-items: center;
      justify-content: center;
    "><span style="
      transform: rotate(45deg);
      color: #ffffff;
      font-weight: 700;
      font-size: 12px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    ">${lettre}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
}

const iconeDepart = creerIconeMarqueur('A', '#00c864');
const iconeArrivee = creerIconeMarqueur('B', '#e11d48');
const iconeRecherche = creerIconeMarqueur('•', '#0a0f1a');

/* Formatage lisible d'une adresse renvoyée par Nominatim */
function formaterAdresseNominatim(data, lat, lon) {
  const addr = data?.address;
  if (!addr) {
    return data?.display_name?.split(',').slice(0, 2).join(', ') || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
  const rue = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || addr.amenity;
  const quartier = addr.suburb || addr.city_district || addr.town || addr.city;
  if (rue && quartier && rue !== quartier) return `${rue}, ${quartier}`;
  return rue || quartier || data.display_name?.split(',')[0] || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

/* Contrôleur interne pour piloter flyTo, fitBounds et les clics carte */
function ControleurCarte({ focusCible, routeCoords, onCarteClic }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (onCarteClic) onCarteClic(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (focusCible) {
      map.flyTo([focusCible.lat, focusCible.lon], 15, { duration: 0.9 });
    }
  }, [focusCible, map]);

  useEffect(() => {
    if (routeCoords && routeCoords.length > 1) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    }
  }, [routeCoords, map]);

  return null;
}

/* Composant Carte interactive (Photon + Nominatim + OSRM) */
function CasablancaMap({ onRouteChange, raccourcis = [], height = '390px', readOnlyRoute = null }) {
  const [pointA, setPointA] = useState(
    readOnlyRoute?.depart_lat && readOnlyRoute?.depart_lon
      ? { lat: Number(readOnlyRoute.depart_lat), lon: Number(readOnlyRoute.depart_lon), adresse: readOnlyRoute.depart || 'Départ' }
      : null
  );
  const [pointB, setPointB] = useState(
    readOnlyRoute?.arrivee_lat && readOnlyRoute?.arrivee_lon
      ? { lat: Number(readOnlyRoute.arrivee_lat), lon: Number(readOnlyRoute.arrivee_lon), adresse: readOnlyRoute.arrivee || 'Arrivée' }
      : null
  );

  const [routeCoords, setRouteCoords] = useState([]);
  const [infosRoute, setInfosRoute] = useState(null);
  const [calculRoute, setCalculRoute] = useState(false);

  /* Recherche Photon (déplace la carte sans créer le trajet) */
  const [requete, setRequete] = useState('');
  const [resultats, setResultats] = useState([]);
  const [rechercheEnCours, setRechercheEnCours] = useState(false);
  const [repereTemp, setRepereTemp] = useState(null);
  const [focusCible, setFocusCible] = useState(null);
  const debounceRef = useRef(null);

  /* Géocodage inversé via Nominatim */
  const reverseGeocode = useCallback(async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=fr`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Nominatim indisponible');
      const data = await res.json();
      return formaterAdresseNominatim(data, lat, lon);
    } catch {
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  }, []);

  /* Calcul d'itinéraire routier via OSRM dès que A et B sont placés */
  useEffect(() => {
    if (!pointA || !pointB) {
      setRouteCoords([]);
      setInfosRoute(null);
      if (!readOnlyRoute && onRouteChange) {
        onRouteChange({
          depart_adresse: pointA?.adresse || '',
          arrivee_adresse: pointB?.adresse || '',
          depart_lat: pointA?.lat ?? null,
          depart_lon: pointA?.lon ?? null,
          arrivee_lat: pointB?.lat ?? null,
          arrivee_lon: pointB?.lon ?? null,
          distance_km: null,
          duree_min: null,
        });
      }
      return;
    }

    let actif = true;
    const calculerOSRM = async () => {
      setCalculRoute(true);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pointA.lon},${pointA.lat};${pointB.lon},${pointB.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (!actif) return;

        if (data?.code === 'Ok' && data.routes?.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
          const distance_km = Number((route.distance / 1000).toFixed(1));
          const duree_min = Math.max(1, Math.round(route.duration / 60));

          setRouteCoords(coords);
          setInfosRoute({ distance_km, duree_min });

          if (onRouteChange) {
            onRouteChange({
              depart_adresse: pointA.adresse,
              arrivee_adresse: pointB.adresse,
              depart_lat: pointA.lat,
              depart_lon: pointA.lon,
              arrivee_lat: pointB.lat,
              arrivee_lon: pointB.lon,
              distance_km,
              duree_min,
            });
          }
        }
      } catch {
        // Fallback ligne droite si OSRM est temporairement indisponible
        if (actif) {
          setRouteCoords([
            [pointA.lat, pointA.lon],
            [pointB.lat, pointB.lon],
          ]);
        }
      } finally {
        if (actif) setCalculRoute(false);
      }
    };

    calculerOSRM();
    return () => { actif = false; };
  }, [pointA, pointB, onRouteChange, readOnlyRoute]);

  /* Recherche Photon avec debounce (filtrée sur countrycode === 'MA') */
  const handleRechercheChange = (val) => {
    setRequete(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setResultats([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setRechercheEnCours(true);
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(val)}&lat=33.5731&lon=-7.5898&limit=5`;
        const res = await fetch(url);
        const data = await res.json();
        const filtres = (data?.features || []).filter(
          (f) => f.properties?.countrycode === 'MA'
        );
        setResultats(filtres);
      } catch {
        setResultats([]);
      } finally {
        setRechercheEnCours(false);
      }
    }, 300);
  };

  /* Sélection d'un résultat Photon ou d'un raccourci : zoom + repère temporaire */
  const allerVersLieu = (lat, lon, label) => {
    setFocusCible({ lat, lon, ts: Date.now() });
    setRepereTemp({ lat, lon, label });
    setResultats([]);
    setRequete(label);
  };

  /* Clic sur la carte : 1er clic = A, 2e clic = B */
  const handleCarteClic = async (lat, lon) => {
    if (readOnlyRoute) return;

    const adresseProvisoire = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

    if (!pointA) {
      setPointA({ lat, lon, adresse: adresseProvisoire });
      const adresse = await reverseGeocode(lat, lon);
      setPointA((prev) => (prev ? { ...prev, adresse } : null));
    } else {
      setPointB({ lat, lon, adresse: adresseProvisoire });
      const adresse = await reverseGeocode(lat, lon);
      setPointB((prev) => (prev ? { ...prev, adresse } : null));
    }
  };

  /* Déplacement par drag & drop des marqueurs A ou B */
  const handleDragEnd = async (cible, e) => {
    const { lat, lng: lon } = e.target.getLatLng();
    const adresse = await reverseGeocode(lat, lon);
    if (cible === 'A') {
      setPointA({ lat, lon, adresse });
    } else {
      setPointB({ lat, lon, adresse });
    }
  };

  const inverserPoints = () => {
    if (!pointA || !pointB) return;
    const tempA = { ...pointA };
    setPointA({ ...pointB });
    setPointB(tempA);
  };

  const reinitialiserPoints = () => {
    setPointA(null);
    setPointB(null);
    setRouteCoords([]);
    setInfosRoute(null);
    setRepereTemp(null);
  };

  const centreInitial = pointA
    ? [pointA.lat, pointA.lon]
    : CASABLANCA_CENTER;

  return (
    <div className="position-relative overflow-hidden border" style={{ borderRadius: '12px', borderColor: '#e2e8f0' }}>
      {/* Barre de recherche flottante + raccourcis (masquée en mode lecture seule) */}
      {!readOnlyRoute && (
        <div
          className="position-absolute top-0 start-0 end-0 p-2 p-sm-3"
          style={{ zIndex: 500, pointerEvents: 'none' }}
        >
          <div className="mx-auto" style={{ maxWidth: '520px', pointerEvents: 'auto' }}>
            <div className="input-group input-group-sm shadow-sm bg-white rounded-3 border">
              <span className="input-group-text bg-white border-0 text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 shadow-none"
                placeholder="Rechercher un quartier à Casablanca (Photon)..."
                value={requete}
                onChange={(e) => handleRechercheChange(e.target.value)}
                style={{ fontSize: '0.84rem' }}
              />
              {rechercheEnCours && (
                <span className="input-group-text bg-white border-0">
                  <span className="spinner-border spinner-border-sm text-secondary"></span>
                </span>
              )}
              {requete && (
                <button
                  type="button"
                  className="btn btn-sm bg-white border-0 text-secondary"
                  onClick={() => { setRequete(''); setResultats([]); }}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>

            {/* Liste déroulante des résultats Photon */}
            {resultats.length > 0 && (
              <div className="list-group shadow-sm mt-1 rounded-3 overflow-hidden border">
                {resultats.map((feat, idx) => {
                  const [lon, lat] = feat.geometry.coordinates;
                  const props = feat.properties || {};
                  const titre = props.name || props.street || props.district || 'Lieu';
                  const sousTitre = [props.district || props.suburb, props.city].filter(Boolean).join(', ');
                  return (
                    <button
                      key={`${lat}-${lon}-${idx}`}
                      type="button"
                      className="list-group-item list-group-item-action py-2 px-3 small text-start"
                      onClick={() => allerVersLieu(lat, lon, titre)}
                    >
                      <div className="fw-semibold text-dark">{titre}</div>
                      {sousTitre && <div className="text-secondary" style={{ fontSize: '0.73rem' }}>{sousTitre}</div>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Raccourcis rapides : lieux issus de l'historique des courses */}
            {raccourcis.length > 0 && (
              <div className="d-flex gap-1 overflow-auto mt-2 pb-1" style={{ scrollbarWidth: 'none' }}>
                {raccourcis.map((r, idx) => (
                  <button
                    key={`${r.label}-${idx}`}
                    type="button"
                    onClick={() => allerVersLieu(r.lat, r.lon, r.label)}
                    className="btn btn-sm bg-white border shadow-sm flex-shrink-0 d-inline-flex align-items-center gap-1"
                    style={{ fontSize: '0.72rem', borderRadius: '999px', padding: '2px 10px', color: '#0a0f1a' }}
                  >
                    <i className="bi bi-clock-history text-secondary" style={{ fontSize: '0.68rem' }}></i>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Carte Leaflet */}
      <MapContainer
        center={centreInitial}
        zoom={13}
        style={{ height, width: '100%', zIndex: 1 }}
        zoomControl={!readOnlyRoute}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ControleurCarte
          focusCible={focusCible}
          routeCoords={routeCoords}
          onCarteClic={handleCarteClic}
        />

        {repereTemp && !readOnlyRoute && (
          <Marker position={[repereTemp.lat, repereTemp.lon]} icon={iconeRecherche}>
            <Popup>
              <div className="small fw-semibold">{repereTemp.label}</div>
              <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                Cliquez sur la carte pour placer A ou B
              </div>
            </Popup>
          </Marker>
        )}

        {pointA && (
          <Marker
            position={[pointA.lat, pointA.lon]}
            icon={iconeDepart}
            draggable={!readOnlyRoute}
            eventHandlers={{
              dragend: (e) => handleDragEnd('A', e),
            }}
          >
            <Popup>
              <div className="small fw-bold text-success">Départ (A)</div>
              <div className="small">{pointA.adresse}</div>
            </Popup>
          </Marker>
        )}

        {pointB && (
          <Marker
            position={[pointB.lat, pointB.lon]}
            icon={iconeArrivee}
            draggable={!readOnlyRoute}
            eventHandlers={{
              dragend: (e) => handleDragEnd('B', e),
            }}
          >
            <Popup>
              <div className="small fw-bold text-danger">Arrivée (B)</div>
              <div className="small">{pointB.adresse}</div>
            </Popup>
          </Marker>
        )}

        {routeCoords.length > 1 && (
          <Polyline positions={routeCoords} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.85 }} />
        )}
      </MapContainer>

      {/* Barre d'état et boutons d'action en bas de la carte */}
      {!readOnlyRoute && (
        <div
          className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 bg-white border-top"
          style={{ borderColor: '#e5e7eb' }}
        >
          <div className="small" style={{ color: '#475569', fontSize: '0.78rem' }}>
            {!pointA ? (
              <span><strong className="text-success">1er clic :</strong> placez le point de départ (A) sur la carte.</span>
            ) : !pointB ? (
              <span><strong className="text-danger">2e clic :</strong> placez la destination (B) sur la carte.</span>
            ) : calculRoute ? (
              <span><span className="spinner-border spinner-border-sm me-1"></span>Calcul de l'itinéraire OSRM...</span>
            ) : infosRoute ? (
              <span className="font-mono-label fw-semibold" style={{ color: '#0a0f1a' }}>
                <i className="bi bi-sign-turn-right text-primary me-1"></i>
                {infosRoute.distance_km} km · ~{infosRoute.duree_min} min
              </span>
            ) : (
              <span>Déplacez A ou B pour ajuster l'itinéraire.</span>
            )}
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              style={{ fontSize: '0.76rem', borderRadius: '7px' }}
              disabled={!pointA || !pointB}
              onClick={inverserPoints}
            >
              Inverser A ↔ B
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              style={{ fontSize: '0.76rem', borderRadius: '7px' }}
              disabled={!pointA && !pointB}
              onClick={reinitialiserPoints}
            >
              Réinitialiser les points
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CasablancaMap;
