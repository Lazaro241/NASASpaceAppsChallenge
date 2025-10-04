from flask import Flask, jsonify, request, render_template_string
import json

app = Flask(__name__)


@app.route("/api/asteroid")
def asteroid():
        sample_data = {
                "name": "Impactor-2025",
                "diameter_km": 0.35,
                "velocity_kms": 25.0,
                "miss_distance_km": 45000
        }

        # If the client prefers HTML (e.g., a browser), return a small visual page.
        best = request.accept_mimetypes.best_match(["text/html", "application/json"])
        if best == "text/html":
                template = """<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{{ name }} — Visualization</title>
        <style>
            body { font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial; padding: 20px; background: #08121a; color: #dff6ff; }
            .card { background: linear-gradient(180deg,#0b2836 0%,#09202a 100%); padding: 18px; border-radius: 10px; max-width: 760px; margin: 0 auto; box-shadow: 0 6px 24px rgba(0,0,0,0.6); }
            h1 { margin: 0 0 8px 0; font-size: 20px; }
            .meta { display:flex; gap:12px; color:#9ed9e8; margin-bottom:12px }
            svg { display:block; margin: 12px auto; background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0)); border-radius:8px }
            .pulse { animation: pulse 1.8s infinite; }
            @keyframes pulse { 0% { opacity:0.8; transform: scale(1); } 50% { opacity:1; transform: scale(1.06); } 100% { opacity:0.8; transform: scale(1); } }
            .legend { font-size: 12px; color:#9ed9e8; text-align:center; margin-top:8px }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>{{ name }}</h1>
            <div class="meta">
                <div>Diameter: <strong>{{ diameter_km }} km</strong></div>
                <div>Velocity: <strong>{{ velocity_kms }} km/s</strong></div>
                <div>Miss distance: <strong>{{ miss_distance_km }} km</strong></div>
            </div>

            <svg id="viz" width="720" height="200" viewBox="0 0 720 200" aria-labelledby="title">
                <title id="title">Asteroid visualization</title>
                <!-- Space line -->
                <line x1="40" y1="100" x2="680" y2="100" stroke="#173744" stroke-width="6" stroke-linecap="round" />
                <!-- Start (Earth) -->
                <g id="earth" transform="translate(40,100)">
                    <circle r="18" fill="#2a9df4" stroke="#123" stroke-width="2"></circle>
                    <text x="-6" y="36" fill="#9ed9e8" font-size="12">Earth</text>
                </g>
                <!-- Asteroid group placed by JS -->
                <g id="asteroid" class="pulse">
                    <circle id="ast-circle" cx="0" cy="0" r="8" fill="#f1c40f" stroke="#7a5a06" stroke-width="2"></circle>
                    <text id="ast-label" x="0" y="28" text-anchor="middle" fill="#ffdca3" font-size="12"></text>
                </g>
            </svg>
            <div class="legend">Velocity animated as pulse; asteroid size & position are scaled for visualization purposes.</div>
        </div>

        <script>
            // Embedded data from server
            const data = {{ data | safe }};

            // Scale factors for visual mapping (tune for demo)
            const diameterScale = 40; // px per km
            const maxDisplayDistance = 200000; // km mapped to the svg track length
            const trackStart = 40;
            const trackEnd = 680;
            const trackLength = trackEnd - trackStart;

            // Compute radius and position
            const radius = Math.max(4, data.diameter_km * diameterScale);
            const clamped = Math.min(data.miss_distance_km, maxDisplayDistance);
            const t = clamped / maxDisplayDistance;
            const x = trackStart + t * trackLength;

            const astGroup = document.getElementById('asteroid');
            const astCircle = document.getElementById('ast-circle');
            const astLabel = document.getElementById('ast-label');

            astCircle.setAttribute('r', String(radius));
            astGroup.setAttribute('transform', `translate(${x},100)`);
            astLabel.textContent = data.name;

            // Map velocity to pulse speed
            const base = Math.min(40, Math.max(5, data.velocity_kms));
            const styleEl = document.createElement('style');
            styleEl.textContent = `.pulse { animation-duration: ${2.5 - Math.min(1.8, base/40)}s; }`;
            document.head.appendChild(styleEl);
        </script>
    </body>
</html>
"""

                return render_template_string(
                        template,
                        name=sample_data["name"],
                        diameter_km=sample_data["diameter_km"],
                        velocity_kms=sample_data["velocity_kms"],
                        miss_distance_km=sample_data["miss_distance_km"],
                        data=json.dumps(sample_data),
                )

        # Default: return JSON for API clients
        return jsonify(sample_data)


if __name__ == "__main__":
        app.run(debug=True)
