
from flask import Flask, jsonify, request, render_template_string
import json
import os
import time
import requests
from impact_calculations import DENSITIES, estimate_impact

app = Flask(__name__)

# Simple in-memory cache to avoid spamming external API during development
# cache structure: { cache_key: (timestamp, data) }
_NEO_CACHE = {}
_NEO_CACHE_TTL = 300  # seconds



def fetch_neo_feed(start_date: str, end_date: str):
    """Fetch NEO feed from NASA API with a tiny cache.

    Returns parsed JSON on success or raises requests.HTTPError on failure.
    """
    cache_key = f"{start_date}:{end_date}"
    now = time.time()
    entry = _NEO_CACHE.get(cache_key)
    if entry:
        ts, data = entry
        if now - ts < _NEO_CACHE_TTL:
            return data

    # Prefer environment variable for API key; fall back to the provided key.
    api_key = os.environ.get('NASA_API_KEY', 'I9NwBBH5lMKaXpBTplmG8CReKqCgpLNUYiEbSNhq')
    url = (
        'https://api.nasa.gov/neo/rest/v1/feed'
        f'?start_date={start_date}&end_date={end_date}&api_key={api_key}'
    )

    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    # store in cache
    _NEO_CACHE[cache_key] = (now, data)
    return data


@app.route('/api/neo-feed')
def neo_feed():
    """Return NASA NEO feed JSON for the requested date range.

    Query params:
      - start_date (YYYY-MM-DD) default: 2025-10-04
      - end_date (YYYY-MM-DD) default: 2025-10-05
    """
    start_date = request.args.get('start_date', '2025-10-04')
    end_date = request.args.get('end_date', '2025-10-05')

    try:
        data = fetch_neo_feed(start_date, end_date)
    except requests.HTTPError as e:
        # forward error
        return jsonify({'error': 'Failed to fetch NEO feed', 'details': str(e)}), 502
    except requests.RequestException as e:
        return jsonify({'error': 'Network error when contacting NASA API', 'details': str(e)}), 502

    # Return the raw JSON from NASA's API.
    return jsonify(data)

@app.route("/api/asteroids-summary")
def asteroids_summary():
    start_date = request.args.get('start_date', '2025-10-04')
    end_date = request.args.get('end_date', '2025-10-05')

    try:
        feed = fetch_neo_feed(start_date, end_date)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 502

    neos = []
    for date, objs in feed.get("near_earth_objects", {}).items():
        for o in objs:
            try:
                ca = o["close_approach_data"][0]
                neos.append({
                    "name": o["name"],
                    "id": o["id"],
                    "diameter_km": o["estimated_diameter"]["kilometers"]["estimated_diameter_max"],
                    "velocity_kms": float(ca["relative_velocity"]["kilometers_per_second"]),
                    "miss_distance_km": float(ca["miss_distance"]["kilometers"]),
                    "date": date
                })
            except (KeyError, IndexError, ValueError):
                continue

    neos.sort(key=lambda x: x["miss_distance_km"])
    return jsonify(neos)

@app.route("/api/impact", methods=["POST"])
def impact():
    data = request.get_json()
    diameter_km = data.get("diameter_km", 1)
    velocity_kms=data.get("velocity_kms", 20)
    diameter_km=data.get("diameter_km", 1)
    impact_angle_deg=data.get("angle", 45)
    results = {}
    for key, dens in DENSITIES.items():
        results[key] = estimate_impact(diameter_km, velocity_kms, dens, impact_angle_deg)
    return jsonify(results)


if __name__ == "__main__":
        app.run(debug=True)
