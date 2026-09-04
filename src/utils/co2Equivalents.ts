export interface Co2Eq {
  emoji: string;
  label: string;
}

// Reference constants:
// Car average: 0.21 kg CO₂/km
// Tree absorption: ~21 kg/year → 0.0575 kg/day
// Home electricity: 28 kWh/day × 0.4 kg/kWh = 11.2 kg/day → 0.467 kg/hr
// Phone charge: ~9 Wh × 0.9 kg/kWh ≈ 0.0081 kg per charge
// Beef burger (~100g patty): ~2.5 kg CO₂
// Flight (economy avg): ~0.09 kg CO₂/km per passenger

export function getCo2Equivalents(kg: number): Co2Eq[] {
  if (kg <= 0.01) return [{ emoji: "✅", label: "Nearly zero impact" }];

  const eqs: Co2Eq[] = [];

  // 🚗 Driving
  const driveKm = kg / 0.21;
  eqs.push({
    emoji: "🚗",
    label: `${driveKm < 10 ? driveKm.toFixed(1) : Math.round(driveKm)} km by car`,
  });

  // 🌳 Tree absorption days
  const treeDays = kg / 0.0575;
  if (treeDays < 30) {
    eqs.push({ emoji: "🌳", label: `${treeDays.toFixed(1)} tree-days to absorb` });
  } else if (treeDays < 365) {
    eqs.push({ emoji: "🌳", label: `${(treeDays / 30).toFixed(1)} tree-months to absorb` });
  } else {
    eqs.push({ emoji: "🌳", label: `${(treeDays / 365).toFixed(1)} trees for a whole year` });
  }

  // 💡 Home electricity hours
  const homeHrs = kg / 0.467;
  if (homeHrs < 1) {
    eqs.push({ emoji: "💡", label: `${Math.round(homeHrs * 60)} min powering a home` });
  } else if (homeHrs < 24) {
    eqs.push({ emoji: "💡", label: `${homeHrs.toFixed(1)} hrs powering a home` });
  } else {
    eqs.push({ emoji: "💡", label: `${(homeHrs / 24).toFixed(1)} days powering a home` });
  }

  // 📱 Phone charges
  const phones = Math.round(kg / 0.0081);
  if (phones <= 1000) {
    eqs.push({ emoji: "📱", label: `${phones} phone charges` });
  }

  // 🍔 Beef burgers (only for > 1 kg)
  if (kg >= 1) {
    const burgers = kg / 2.5;
    eqs.push({ emoji: "🍔", label: `${burgers.toFixed(1)} beef burgers' worth` });
  }

  // ✈️ Flight (only for > 3 kg)
  if (kg >= 3) {
    const flightKm = Math.round(kg / 0.09);
    eqs.push({ emoji: "✈️", label: `${flightKm} km economy flight` });
  }

  return eqs;
}
