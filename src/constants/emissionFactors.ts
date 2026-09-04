/**
 * Axiom Emission Factors
 *
 * All values are in kg CO₂ per unit.
 * These run entirely on-device — no API call needed.
 */

/** Transport: kg CO₂ per km */
export const TRANSPORT_FACTORS: Record<string, number> = {
  walking: 0.0,
  cycling: 0.0,
  bus: 0.089,
  train: 0.041,
  car: 0.192,
  motorbike: 0.103,
  car_shared: 0.096,
  short_flight: 0.255,
  long_flight: 0.195,
};

/** Food: kg CO₂ per portion */
export const FOOD_FACTORS: Record<string, number> = {
  beef: 3.5,
  lamb: 2.4,
  pork: 1.2,
  chicken: 0.66,
  fish: 0.4,
  vegetarian: 0.5,
  vegan: 0.2,
  lentils: 0.08,
};

/** Energy: kg CO₂ per unit (kWh or per-use) */
export const ENERGY_FACTORS: Record<string, number> = {
  electricity: 0.233,      // per kWh
  heating_gas: 0.203,      // per kWh
  heating_oil: 0.298,      // per kWh
  short_shower: 0.02,      // per shower
  long_shower: 0.06,       // per shower
  eco_mode: 0.06,          // per session
  standby: 0.03,           // per day/session
  devices_off: 0.0,        // per day/session
};

/** Shopping: kg CO₂ per item (rough estimates) */
export const SHOPPING_FACTORS: Record<string, number> = {
  clothing: 5.0,
  electronics: 20.0,
  furniture: 30.0,
  general: 2.0,
  fast_fashion: 5.0,
  secondhand: 1.0,
};

/** Category → factor map */
export const EMISSION_FACTORS: Record<string, Record<string, number>> = {
  transport: TRANSPORT_FACTORS,
  food: FOOD_FACTORS,
  energy: ENERGY_FACTORS,
  shopping: SHOPPING_FACTORS,
};
