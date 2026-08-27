const nutrientProfiles = {
  nitrogen: {
    low: {
      severity: "high",
      message: "Nitrogen level is below the recommended range.",
    },
    medium: {
      severity: "moderate",
      message: "Nitrogen level is adequate but should be monitored.",
    },
  },
  phosphorus: {
    low: {
      severity: "high",
      message: "Phosphorus level is below the recommended range.",
    },
    medium: {
      severity: "moderate",
      message: "Phosphorus level is moderate and should be checked periodically.",
    },
  },
  potassium: {
    low: {
      severity: "high",
      message: "Potassium level is below the recommended range.",
    },
    medium: {
      severity: "moderate",
      message: "Potassium level is moderate; crop response should be monitored.",
    },
  },
  zinc: {
    low: {
      severity: "moderate",
      message: "Possible zinc deficiency in the soil.",
    },
  },
  iron: {
    low: {
      severity: "moderate",
      message: "Possible iron deficiency in the soil.",
    },
  },
  manganese: {
    low: {
      severity: "moderate",
      message: "Possible manganese deficiency in the soil.",
    },
  },
  copper: {
    low: {
      severity: "moderate",
      message: "Possible copper deficiency in the soil.",
    },
  },
  boron: {
    low: {
      severity: "moderate",
      message: "Possible boron deficiency in the soil.",
    },
  },
  organicCarbon: {
    low: {
      severity: "moderate",
      message: "Organic carbon is low; soil structure and fertility may need improvement.",
    },
  },
  ph: {
    acidic: {
      severity: "moderate",
      message: "Soil pH is below the preferred range; nutrient availability may be reduced.",
    },
    alkaline: {
      severity: "moderate",
      message: "Soil pH is above the preferred range; nutrient availability may be reduced.",
    },
  },
};

export const detectDeficiencies = (soil = {}) => {
  const results = [];

  const pH = Number(soil.ph ?? 0);
  const nitrogen = Number(soil.nitrogen ?? 0);
  const phosphorus = Number(soil.phosphorus ?? 0);
  const potassium = Number(soil.potassium ?? 0);
  const organicCarbon = Number(soil.organicCarbon ?? 0);

  const micronutrients = soil.micronutrients || {};

  const check = (name, value, lowThreshold, type = "low") => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) return;

    if (type === "low" && value < lowThreshold) {
      const profile = nutrientProfiles[name]?.low || {
        severity: "moderate",
        message: `${name} is low in the soil.`,
      };

      results.push({
        nutrient: name,
        status: "low",
        severity: profile.severity,
        message: profile.message,
      });
    }

    if (type === "ph" && value < 5.5) {
      results.push({
        nutrient: "pH",
        status: "acidic",
        severity: nutrientProfiles.ph.acidic.severity,
        message: nutrientProfiles.ph.acidic.message,
      });
    }

    if (type === "ph" && value > 8.5) {
      results.push({
        nutrient: "pH",
        status: "alkaline",
        severity: nutrientProfiles.ph.alkaline.severity,
        message: nutrientProfiles.ph.alkaline.message,
      });
    }
  };

  check("nitrogen", nitrogen, 40);
  check("phosphorus", phosphorus, 20);
  check("potassium", potassium, 30);
  check("organicCarbon", organicCarbon, 0.5);

  Object.entries(micronutrients).forEach(([key, value]) => {
    if (value !== undefined && value !== null && Number(value) < 0.5) {
      const profile = nutrientProfiles[key]?.low || {
        severity: "moderate",
        message: `Possible ${key} deficiency in the soil.`,
      };

      results.push({
        nutrient: key,
        status: "low",
        severity: profile.severity,
        message: profile.message,
      });
    }
  });

  if (!Number.isNaN(pH) && (pH < 5.5 || pH > 8.5)) {
    const status = pH < 5.5 ? "acidic" : "alkaline";
    results.push({
      nutrient: "pH",
      status,
      severity: nutrientProfiles.ph[status].severity,
      message: nutrientProfiles.ph[status].message,
    });
  }

  return results;
};

export default detectDeficiencies;
