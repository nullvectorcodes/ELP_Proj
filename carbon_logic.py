def calculate_carbon(activity: str):
    import re

    # ---------------------------------------
    # 📌 GLOBAL EMISSION FACTORS (kg CO2e)
    # ---------------------------------------

    EMISSION_FACTORS = {
        "transport": {
            "car": 0.20,           # kg per km
            "motorbike": 0.10,
            "bus": 0.05,
            "train": 0.03,
            "flight": 0.25,        # per km (short estimate)
            "cycle": 0.0,          # saved = 0.2 * km
            "walk": 0.0,
        },
        "energy": {
            "electricity": 0.82,   # per kWh (India avg)
            "lpg": 2.98,           # per kg
            "natural_gas": 1.90    # per m³
        },
        "food": {
            "beef": 27.0,          # per kg
            "chicken": 6.9,
            "milk": 1.3,
            "rice": 2.7,
            "vegetables": 0.5,
        },
        "waste": {
            "plastic": 6.0,        # per kg
            "paper": 1.3
        }
    }


    # ---------------------------------------
    # 📌 SMART NUMBER EXTRACTOR
    # ---------------------------------------
    def extract_quantity(text: str):
        # km, kwh, kg, m3
        units = {
            "km": "distance",
            "kwh": "energy",
            "kw": "energy",
            "kg": "weight",
            "m3": "volume"
        }
        
        match = re.search(r"(\d+(\.\d+)?)\s*(km|kwh|kw|kg|m3)", text)
        if match:
            return float(match.group(1)), units.get(match.group(3))
        
        return None, None


    # ---------------------------------------
    # 📌 MAIN CALCULATOR
    # ---------------------------------------
    def calculate_carbon(activity: str):
        activity = activity.lower()

        # Extract value + unit
        qty, unit_type = extract_quantity(activity)

        # Default values
        if qty is None:
            qty = 1  # fallback if user did not specify value

        # ---------------------------------------
        # TRANSPORT
        # ---------------------------------------
        for mode, factor in EMISSION_FACTORS["transport"].items():
            if mode in activity:
                if mode in ["cycle", "walk"]:
                    saved = qty * 0.20  # assume car alternative saves 0.2 per km
                    return {
                        "activity": mode,
                        "raw_input": activity,
                        "quantity": qty,
                        "unit": "km",
                        "type": "saved",
                        "co2": saved,
                        "message": f"🚴 {mode.title()} {qty} km saved {saved:.2f} kg CO₂"
                    }
                else:
                    emitted = qty * factor
                    return {
                        "activity": mode,
                        "raw_input": activity,
                        "quantity": qty,
                        "unit": "km",
                        "type": "emitted",
                        "co2": -emitted,
                        "message": f"🚗 {mode.title()} {qty} km emitted {emitted:.2f} kg CO₂"
                    }

        # ---------------------------------------
        # ENERGY
        # ---------------------------------------
        for source, factor in EMISSION_FACTORS["energy"].items():
            if source in activity:
                emitted = qty * factor
                return {
                    "activity": source,
                    "raw_input": activity,
                    "quantity": qty,
                    "unit": "kWh" if unit_type == "energy" else "units",
                    "type": "emitted",
                    "co2": -emitted,
                    "message": f"⚡ Using {qty} kWh {source} emitted {emitted:.2f} kg CO₂"
                }

        # ---------------------------------------
        # FOOD
        # ---------------------------------------
        for food, factor in EMISSION_FACTORS["food"].items():
            if food in activity:
                emitted = qty * factor
                return {
                    "activity": food,
                    "raw_input": activity,
                    "quantity": qty,
                    "unit": "kg",
                    "type": "emitted",
                    "co2": -emitted,
                    "message": f"🍗 Eating {qty} kg of {food} emitted {emitted:.2f} kg CO₂"
                }

        # ---------------------------------------
        # WASTE
        # ---------------------------------------
        for item, factor in EMISSION_FACTORS["waste"].items():
            if item in activity:
                emitted = qty * factor
                return {
                    "activity": item,
                    "raw_input": activity,
                    "quantity": qty,
                    "unit": "kg",
                    "type": "emitted",
                    "co2": -emitted,
                    "message": f"🗑️ Disposing {qty} kg of {item} emitted {emitted:.2f} kg CO₂"
                }

        # ---------------------------------------
        # NONE MATCHED
        # ---------------------------------------
        return {
            "activity": "unknown",
            "raw_input": activity,
            "quantity": 0,
            "unit": "",
            "type": "none",
            "co2": 0.0,
            "message": "🤔 I couldn't understand that activity."
        }

