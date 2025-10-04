#!/usr/bin/env python3
"""
Impactor 2024 - Flask Backend API
NASA Space Apps Challenge 2024
"""

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import requests

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)  # Permitir CORS para el frontend

# Configuración
NASA_API_KEY = os.getenv('NASA_API_KEY', 'DEMO_KEY')

@app.route('/')
def home():
    """Endpoint de bienvenida"""
    return jsonify({
        'message': '🚀 Welcome to Impactor 2024 API',
        'project': 'NASA Space Apps Challenge 2024',
        'description': 'Meteor Impact Prediction System',
        'status': 'active'
    })

@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Impactor 2024 Backend',
        'nasa_api_key': 'configured' if NASA_API_KEY != 'DEMO_KEY' else 'using_demo'
    })

@app.route('/api/neo/feed')
def neo_feed():
    """Obtener feed de Near Earth Objects de NASA"""
    try:
        # URL de la API de NASA CNEOS
        url = f"https://api.nasa.gov/neo/rest/v1/feed"
        params = {
            'api_key': NASA_API_KEY
        }
        
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'success': True,
                'data': data,
                'source': 'NASA CNEOS API'
            })
        else:
            return jsonify({
                'success': False,
                'error': f'NASA API returned status {response.status_code}',
                'message': 'Failed to fetch NEO data'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error connecting to NASA API'
        }), 500

@app.route('/api/asteroids/random')
def random_asteroids():
    """Obtener asteroides aleatorios"""
    try:
        url = f"https://api.nasa.gov/neo/rest/v1/neo/browse"
        params = {
            'api_key': NASA_API_KEY,
            'size': 5
        }
        
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'success': True,
                'data': data,
                'source': 'NASA Small-Body Database'
            })
        else:
            return jsonify({
                'success': False,
                'error': f'NASA API returned status {response.status_code}'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)