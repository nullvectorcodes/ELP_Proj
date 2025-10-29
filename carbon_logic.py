def calculate_carbon(activity: str):
    activity = activity.lower()
    km = 1

    # Extract number if user mentioned distance
    import re
    match = re.search(r"(\d+(\.\d+)?)\s*km", activity)
    if match:
        km = float(match.group(1))

    if "car" in activity:
        emission = km * 0.2  # kg CO₂ per km
        return f"🚗 Driving {km} km emitted {emission:.2f} kg CO₂", -emission
    elif "cycle" in activity or "bike" in activity:
        saved = km * 0.2
        return f"🚴 Cycling {km} km saved {saved:.2f} kg CO₂", saved
    elif "walk" in activity:
        saved = km * 0.2
        return f"🚶 Walking {km} km saved {saved:.2f} kg CO₂", saved
    elif "bus" in activity:
        emission = km * 0.05
        return f"🚌 Bus travel for {km} km emitted {emission:.2f} kg CO₂", -emission
    else:
        return "🤔 I couldn’t detect a travel mode.", 0.0
