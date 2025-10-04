import math

DENSITIES = {
    "C": 1500,   # Carbonáceo (poroso, friable)
    "S": 3000,   # Rocoso (silicatos)
    "M": 6000    # Metálico (níquel-hierro)
}

def estimate_impact(diameter_km, velocity_kms, density, impact_angle_deg=45):

    # --- Conversión de unidades ---
    r = (diameter_km * 1000) / 2
    v = velocity_kms * 1000
    theta = math.radians(impact_angle_deg)

    # --- Masa (kg) ---
    mass = (4/3) * math.pi * (r**3) * density

    # --- Energía cinética (J) ---
    E = 0.5 * mass * (v**2)
    E_mt = E / 4.184e15  # a megatones TNT

    # --- Cálculo del cráter (ajustado a densidad real) ---
    # Ecuación derivada de Holsapple (1993), Collins et al. (2005)
    g = 9.81  # m/s²
    crater_diameter_km = 1.161 * (density/3000)**0.333 * (velocity_kms/20)**0.44 * (diameter_km**0.78)
    crater_radius_km = crater_diameter_km / 2

    # --- Radio de onda expansiva (zona de daño) ---
    shockwave_radius_km = crater_radius_km * 3.5  # proporción empírica

    # --- Comparación histórica ---
    comparison = compare_explosion(E_mt)

    return {
        "energy_megatons": round(E_mt, 2),
        "density_kg_m3": density,
        "crater_radius_km": round(crater_radius_km, 2),
        "shockwave_radius_km": round(shockwave_radius_km, 2),
        "comparison": comparison
    }

def compare_explosion(energy_mt: float):
    """
    Compara la energía del impacto con eventos y explosiones históricas.
    Devuelve datos estructurados para visualización.
    """

    # Base de eventos conocidos (fuente: NASA, USGS, Impact Effects Program)
    references = [
        {"name": "Bomba de Hiroshima", "energy_mt": 0.015, "type": "nuclear", "category": "local devastation"},
        {"name": "Bomba Zar (URSS, 1961)", "energy_mt": 50, "type": "nuclear", "category": "regional destruction"},
        {"name": "Evento de Chelyabinsk (2013)", "energy_mt": 0.5, "type": "meteor", "category": "city damage"},
        {"name": "Evento de Tunguska (1908)", "energy_mt": 15, "type": "meteor", "category": "regional devastation"},
        {"name": "Monte St. Helens (1980)", "energy_mt": 24, "type": "volcanic", "category": "regional"},
        {"name": "Krakatoa (1883)", "energy_mt": 200, "type": "volcanic", "category": "continental"},
        {"name": "Evento de Chicxulub (KT extinction)", "energy_mt": 1e8, "type": "asteroid", "category": "global extinction"}
    ]

    # Ordenar por energía
    references.sort(key=lambda x: x["energy_mt"])

    # Encontrar evento más cercano en magnitud
    closest = min(references, key=lambda x: abs(math.log10(energy_mt) - math.log10(x["energy_mt"])))
    ratio = energy_mt / closest["energy_mt"]

    # Definir nivel de severidad aproximado
    if energy_mt < 0.1:
        severity = "local"
    elif energy_mt < 10:
        severity = "regional"
    elif energy_mt < 1000:
        severity = "continental"
    elif energy_mt < 1e6:
        severity = "global"
    else:
        severity = "planetary"

    return {
        "closest_event": closest["name"],
        "ratio": round(ratio, 2),
        "severity": severity,
        "category": closest["category"],
        "summary": f"≈ {round(ratio,1)}× la energía de {closest['name']} ({closest['energy_mt']} Mt TNT)"
    }
