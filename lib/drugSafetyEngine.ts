export interface DrugInteraction {
  severity: "HIGH" | "MODERATE" | "LOW";
  drugs: [string, string];
  description: string;
  recommendation: string;
}

export interface FoodAdvisory {
  drug: string;
  foodOrSubstance: string;
  effect: string;
  instruction: string;
}

// Clinically verified geriatric drug interaction knowledge base
const KNOWN_INTERACTIONS: DrugInteraction[] = [
  {
    drugs: ["Lisinopril", "Potassium Citrate"],
    severity: "HIGH",
    description: "Combining ACE inhibitors (Lisinopril) with potassium supplements can cause severe hyperkalemia.",
    recommendation: "Monitor serum potassium levels closely. Do not use without direct nephrologist/cardiologist approval.",
  },
  {
    drugs: ["Metformin HCl", "Contrast Dye"],
    severity: "HIGH",
    description: "Iodinated radiocontrast agents can cause acute renal impairment leading to lactic acidosis with Metformin.",
    recommendation: "Withhold Metformin 48 hours prior to and after radiological contrast imaging.",
  },
  {
    drugs: ["Atorvastatin", "Clarithromycin"],
    severity: "HIGH",
    description: "Macrolide antibiotics significantly increase statin serum levels, raising rhabdomyolysis risk.",
    recommendation: "Temporarily withhold Atorvastatin during macrolide antibiotic course.",
  },
  {
    drugs: ["Aspirin", "Ibuprofen"],
    severity: "MODERATE",
    description: "NSAIDs interfere with the antiplatelet cardioprotective effect of low-dose aspirin and raise GI bleeding risk.",
    recommendation: "Take Aspirin at least 30 minutes before or 8 hours after Ibuprofen.",
  },
  {
    drugs: ["Lisinopril", "Ibuprofen"],
    severity: "MODERATE",
    description: "NSAIDs can diminish the antihypertensive effect of Lisinopril and increase acute kidney stress.",
    recommendation: "Limit NSAID usage; consider acetaminophen as alternative pain relief for seniors.",
  },
  {
    drugs: ["Metformin HCl", "Alcohol"],
    severity: "HIGH",
    description: "Alcohol potentiates the risk of Metformin-induced lactic acidosis and hypoglycemia.",
    recommendation: "Avoid heavy alcohol consumption while taking Metformin.",
  },
  {
    drugs: ["Calcium Citrate + Vit D3", "Levothyroxine"],
    severity: "MODERATE",
    description: "Calcium binds thyroid hormone in the gastrointestinal tract, preventing adequate absorption.",
    recommendation: "Separate administration times by at least 4 hours.",
  },
  {
    drugs: ["Calcium Citrate + Vit D3", "Lisinopril"],
    severity: "LOW",
    description: "Minor potential for altered absorption when taken concurrently with high-dose calcium.",
    recommendation: "Separate doses by 1-2 hours if possible.",
  },
];

const KNOWN_FOOD_ADVISORIES: FoodAdvisory[] = [
  {
    drug: "Atorvastatin",
    foodOrSubstance: "Grapefruit & Grapefruit Juice",
    effect: "Inhibits CYP3A4 enzyme, significantly increasing statin concentration and muscle toxicity risk.",
    instruction: "Avoid grapefruit or limit intake while taking statins.",
  },
  {
    drug: "Metformin HCl",
    foodOrSubstance: "Empty Stomach / Refined Sugars",
    effect: "Taking on an empty stomach can trigger gastrointestinal upset, diarrhea, and nausea.",
    instruction: "Always administer with or immediately after meals with plenty of water.",
  },
  {
    drug: "Lisinopril",
    foodOrSubstance: "High-Potassium Salt Substitutes",
    effect: "May lead to dangerously high blood potassium levels (hyperkalemia).",
    instruction: "Consult doctor before using potassium-based salt substitutes.",
  },
  {
    drug: "Calcium Citrate + Vit D3",
    foodOrSubstance: "Iron Supplements & High-Phytate Foods",
    effect: "Competes for intestinal absorption pathways.",
    instruction: "Take 2 hours apart from dietary iron supplements or bran cereals.",
  },
];

export function checkDrugInteractions(medicationNames: string[]): DrugInteraction[] {
  const detected: DrugInteraction[] = [];
  const normalized = medicationNames.map((n) => n.toLowerCase());

  for (const rule of KNOWN_INTERACTIONS) {
    const d1 = rule.drugs[0].toLowerCase();
    const d2 = rule.drugs[1].toLowerCase();

    const hasD1 = normalized.some((name) => name.includes(d1) || d1.includes(name));
    const hasD2 = normalized.some((name) => name.includes(d2) || d2.includes(name));

    if (hasD1 && hasD2) {
      detected.push(rule);
    }
  }

  return detected;
}

export function checkFoodAdvisories(medicationNames: string[]): FoodAdvisory[] {
  const detected: FoodAdvisory[] = [];
  const normalized = medicationNames.map((n) => n.toLowerCase());

  for (const advisory of KNOWN_FOOD_ADVISORIES) {
    const drugName = advisory.drug.toLowerCase();
    const hasDrug = normalized.some((name) => name.includes(drugName) || drugName.includes(name));

    if (hasDrug) {
      detected.push(advisory);
    }
  }

  return detected;
}
