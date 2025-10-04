import math

DENSITIES = {
    "C": 1500,   # Carbonaceous (porous, friable)
    "S": 3000,   # Stony (silicates)
    "M": 6000    # Metallic (nickel-iron)
}

TARGET_DENSITY = 2700  # kg/m³, average for crystalline rock (from Collins et al., 2005)

def estimate_impact(diameter_km, velocity_kms, density, impact_angle_deg=45):
    # --- Unit conversions ---
    diameter_m = diameter_km * 1000
    radius_m = diameter_m / 2
    velocity_ms = velocity_kms * 1000
    theta_rad = math.radians(impact_angle_deg)  # Angle from horizontal (90° = vertical impact)
    sin_theta = math.sin(theta_rad)
    g = 9.81  # m/s², Earth gravity

    # --- Mass (kg) ---
    volume_m3 = (4/3) * math.pi * (radius_m ** 3)
    mass = volume_m3 * density

    # --- Kinetic energy (J) ---
    E = 0.5 * mass * (velocity_ms ** 2)
    E_mt = E / 4.184e15  # Megatons TNT

    # --- Transient crater diameter (m) from Collins et al. (2005) ---
    rho_i = density
    rho_t = TARGET_DENSITY
    D_tc_m = 1.161 * (rho_i / rho_t)**(1/3) * diameter_m**0.78 * velocity_ms**0.44 * g**(-0.22) * (sin_theta)**(1/3)
    D_tc_km = D_tc_m / 1000

    # --- Final crater diameter (km) ---
    D_c = 3.2  # Transition diameter (km) for simple to complex craters
    if D_tc_km < (D_c / 1.25):  # Approx 2.56 km threshold for transient
        crater_diameter_km = 1.25 * D_tc_km  # Simple crater adjustment
    else:
        crater_diameter_km = 1.17 * D_tc_km**1.13 * D_c**(-0.13)  # Complex crater scaling

    crater_radius_km = crater_diameter_km / 2

    # --- Shockwave radius (km) for ~5 psi overpressure (heavy damage threshold) ---
    # Approximation based on surface nuclear burst scaling (e.g., Glasstone & Dolan, 1977; NukeMap data)
    # R ≈ 6.4 * E_mt^{1/3} km (e.g., ~6.4 km for 1 Mt yield)
    shockwave_radius_km = 6.4 * (E_mt ** (1/3)) if E_mt > 0 else 0

    # --- Historical comparison ---
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
    Compares the impact energy to historical events.
    Returns structured data for visualization.
    """

    # Base of known events (source: NASA, USGS, Impact Effects Program)
    references = [
        {"name": "Hiroshima Bomb", "energy_mt": 0.015, "type": "nuclear", "category": "local devastation"},
        {"name": "Tsar Bomba (USSR, 1961)", "energy_mt": 50, "type": "nuclear", "category": "regional destruction"},
        {"name": "Chelyabinsk Event (2013)", "energy_mt": 0.5, "type": "meteor", "category": "city damage"},
        {"name": "Tunguska Event (1908)", "energy_mt": 15, "type": "meteor", "category": "regional devastation"},
        {"name": "Mount St. Helens (1980)", "energy_mt": 24, "type": "volcanic", "category": "regional"},
        {"name": "Krakatoa (1883)", "energy_mt": 200, "type": "volcanic", "category": "continental"},
        {"name": "Chicxulub Event (KT extinction)", "energy_mt": 1e8, "type": "asteroid", "category": "global extinction"}
    ]

    # Sort by energy
    references.sort(key=lambda x: x["energy_mt"])

    # Find closest event by log-scale difference
    closest = min(references, key=lambda x: abs(math.log10(energy_mt) - math.log10(x["energy_mt"])))
    ratio = energy_mt / closest["energy_mt"]

    # Define approximate severity level
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
        "summary": f"≈ {round(ratio,1)}× the energy of {closest['name']} ({closest['energy_mt']} Mt TNT)"
    }