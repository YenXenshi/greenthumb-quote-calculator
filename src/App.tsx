import React, { useState, useId } from "react";
import {
  Check,
  Copy,
  Scissors,
  Sparkles,
  ShieldCheck,
  Phone,
  Mail,
  RotateCcw,
  Info,
  CheckCircle2,
  Calendar,
  Share2,
} from "lucide-react";

/* ==========================================================================
   PRICING CONFIGURATION (EASY TO EDIT LIST AT THE TOP OF THE CODE)
   Modify service rates, minimum charges, and add-on pricing right here.
   ========================================================================== */
export const PRICING_CONFIG = {
  business: {
    name: "GreenThumb Lawn Care",
    tagline: "Residential Lawn Care & Property Maintenance",
    phone: "(555) 234-5678",
    email: "quotes@greenthumblawncare.com",
    serviceArea: "Springfield & Surrounding Neighborhoods",
    guarantee: "100% Satisfaction Guaranteed • Licensed & Insured",
  },
  services: [
    {
      id: "mow",
      name: "Mow",
      description: "Precision mow front & back turf, weed-trim perimeters, and blow clear all hard surfaces.",
      ratePerSqFt: 0.02, // $0.02 per square foot
      minimumPrice: 25.0, // $25 minimum
      badge: "Standard",
    },
    {
      id: "mow_edge",
      name: "Mow and Edge",
      description: "Mowing plus crisp blade edging along concrete driveways, curbs, walkways, and garden beds.",
      ratePerSqFt: 0.028, // $0.028 per square foot
      minimumPrice: 35.0, // $35 minimum
      badge: "Most Popular",
    },
    {
      id: "full_cleanup",
      name: "Full Cleanup",
      description: "Mow, mechanical edge, hedge line touch-up, debris haul, and high-velocity driveway blowout.",
      ratePerSqFt: 0.045, // $0.045 per square foot
      minimumPrice: 60.0, // $60 minimum
      badge: "Premium Complete",
    },
  ],
  addons: [
    {
      id: "bag_clippings",
      name: "Bag the clippings",
      description: "Collect, double-bag, and responsibly dispose of all grass clippings off-site.",
      ratePerSqFt: 0.005, // $0.005 per square foot
      minimumPrice: 15.0, // $15 minimum
    },
    {
      id: "weed_treatment",
      name: "Weed treatment",
      description: "Targeted eco-friendly broadleaf spray and pre-emergent barrier for turf & borders.",
      ratePerSqFt: 0.008, // $0.008 per square foot
      minimumPrice: 25.0, // $25 minimum
    },
    {
      id: "perimeter_hedging",
      name: "Perimeter hedge touch-up",
      description: "Light shearing and shaping of ornamental shrub borders and front foundation bushes.",
      ratePerSqFt: 0.006, // $0.006 per square foot
      minimumPrice: 20.0, // $20 minimum
    },
  ],
  presets: [
    { label: "Small / Townhome", sqft: 1800 },
    { label: "Suburban Standard", sqft: 4500 },
    { label: "Corner Lot", sqft: 8000 },
    { label: "Quarter Acre", sqft: 10890 },
  ],
};

/* ==========================================================================
   HELPER UTILITIES
   ========================================================================== */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function App() {
  const lawnSizeInputId = useId();
  // State
  const [lawnSizeStr, setLawnSizeStr] = useState<string>("4500");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("mow_edge");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([
    "bag_clippings",
  ]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"calculator" | "rate_sheet">("calculator");

  // Parse lawn size
  const parsedSize = parseFloat(lawnSizeStr.replace(/,/g, ""));
  const isValidSize = !isNaN(parsedSize) && parsedSize > 0;

  // Selected service
  const selectedService =
    PRICING_CONFIG.services.find((s) => s.id === selectedServiceId) ||
    PRICING_CONFIG.services[0];

  // Selected add-ons
  const selectedAddons = PRICING_CONFIG.addons.filter((a) =>
    selectedAddonIds.includes(a.id)
  );

  // Price calculations
  const calculateItemPrice = (ratePerSqFt: number, minimumPrice: number) => {
    if (!isValidSize) return { raw: 0, final: 0, isMinApplied: false };
    const raw = parsedSize * ratePerSqFt;
    const final = Math.max(raw, minimumPrice);
    const isMinApplied = raw < minimumPrice;
    return { raw, final, isMinApplied };
  };

  const servicePriceInfo = calculateItemPrice(
    selectedService.ratePerSqFt,
    selectedService.minimumPrice
  );

  const addonsPriceInfo = selectedAddons.map((addon) => {
    const info = calculateItemPrice(addon.ratePerSqFt, addon.minimumPrice);
    return {
      ...addon,
      ...info,
    };
  });

  const totalPrice = isValidSize
    ? servicePriceInfo.final +
      addonsPriceInfo.reduce((acc, curr) => acc + curr.final, 0)
    : 0;

  // Toggle add-on
  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  // Generate plain text quote breakdown
  const generatePlainTextQuote = () => {
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    let text = `========================================\n`;
    text += `${PRICING_CONFIG.business.name.toUpperCase()}\n`;
    text += `Instant Service Estimate • ${dateStr}\n`;
    text += `Phone: ${PRICING_CONFIG.business.phone}\n`;
    text += `Email: ${PRICING_CONFIG.business.email}\n`;
    text += `========================================\n\n`;

    if (!isValidSize) {
      text += `Lawn Size: Not specified\n`;
      text += `Please provide your lawn square footage for an exact quote.\n`;
      return text;
    }

    text += `ESTIMATED PROPERTY SPECS:\n`;
    text += `• Turf Area: ${formatNumber(parsedSize)} sq ft\n\n`;

    text += `SELECTED SERVICE BREAKDOWN:\n`;
    text += `1. ${selectedService.name}\n`;
    text += `   Rate: $${selectedService.ratePerSqFt.toFixed(3)}/sq ft ($${selectedService.minimumPrice.toFixed(2)} min)\n`;
    if (servicePriceInfo.isMinApplied) {
      text += `   Calculation: Minimum base price applied -> ${formatCurrency(servicePriceInfo.final)}\n`;
    } else {
      text += `   Calculation: ${formatNumber(parsedSize)} sq ft x $${selectedService.ratePerSqFt.toFixed(3)} = ${formatCurrency(servicePriceInfo.final)}\n`;
    }
    text += `\n`;

    if (selectedAddons.length > 0) {
      text += `OPTIONAL ADD-ONS:\n`;
      addonsPriceInfo.forEach((addon, index) => {
        text += `${index + 2}. ${addon.name}\n`;
        text += `   Rate: $${addon.ratePerSqFt.toFixed(3)}/sq ft ($${addon.minimumPrice.toFixed(2)} min)\n`;
        if (addon.isMinApplied) {
          text += `   Calculation: Minimum base price applied -> ${formatCurrency(addon.final)}\n`;
        } else {
          text += `   Calculation: ${formatNumber(parsedSize)} sq ft x $${addon.ratePerSqFt.toFixed(3)} = ${formatCurrency(addon.final)}\n`;
        }
      });
      text += `\n`;
    }

    text += `----------------------------------------\n`;
    text += `TOTAL ESTIMATE: ${formatCurrency(totalPrice)}\n`;
    text += `----------------------------------------\n\n`;
    text += `Notes:\n`;
    text += `• Estimate includes standard fuel, commercial equipment, and labor.\n`;
    text += `• ${PRICING_CONFIG.business.guarantee}\n`;
    text += `• Call ${PRICING_CONFIG.business.phone} to lock in your preferred weekly or bi-weekly visit!\n`;

    return text;
  };

  // Copy to clipboard handler
  const handleCopyQuote = async () => {
    const text = generatePlainTextQuote();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or restricted permissions
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Reset to default
  const handleReset = () => {
    setLawnSizeStr("4500");
    setSelectedServiceId("mow_edge");
    setSelectedAddonIds(["bag_clippings"]);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Bar Contract (1 row, 3 zones, no pill clutter) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand title wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Scissors className="w-5 h-5 text-emerald-200 rotate-45" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-stone-900 block leading-tight">
                {PRICING_CONFIG.business.name}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-stone-600">
            <button
              onClick={() => setActiveTab("calculator")}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === "calculator"
                  ? "text-emerald-800 border-b-2 border-emerald-800 font-semibold"
                  : ""
              }`}
            >
              Quote Calculator
            </button>
            <button
              onClick={() => setActiveTab("rate_sheet")}
              className={`hover:text-emerald-800 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === "rate_sheet"
                  ? "text-emerald-800 border-b-2 border-emerald-800 font-semibold"
                  : ""
              }`}
            >
              Transparent Rate Sheet
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${PRICING_CONFIG.business.phone.replace(/[^0-9]/g, "")}`}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden md:inline">{PRICING_CONFIG.business.phone}</span>
              <span className="md:hidden">Call</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Hero Section */}
        <div className="mb-8 relative rounded-2xl overflow-hidden bg-stone-900 text-white border border-stone-800 shadow-sm">
          <div className="relative min-h-[220px] sm:min-h-[260px] flex flex-col justify-end p-6 sm:p-10">
            {/* Background Image with Measured Contrast Scrim */}
            <img
              src="/src/assets/images/lawn_care_hero_1793836311017.jpg"
              alt="Lush manicured lawn with sharp mower stripes and stone walk"
              className="absolute inset-0 w-full h-full object-cover object-center brightness-85"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-black/30" />

            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium mb-2 tracking-wide uppercase">
                <span>Instant Estimator</span>
                <span aria-hidden="true">·</span>
                <span>No Waiting</span>
                <span aria-hidden="true">·</span>
                <span>Transparent Rates</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                Fair, Instant Lawn Care Estimates
              </h1>
              <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-normal">
                Enter your yard size in square feet, select your service, and add any extras. Get a clean line-by-line price estimate in seconds.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher for Mobile */}
        <div className="sm:hidden mb-6 flex border border-stone-200 rounded-lg p-1 bg-white">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === "calculator"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab("rate_sheet")}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === "rate_sheet"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Rate Sheet
          </button>
        </div>

        {activeTab === "calculator" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Inputs (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Lawn Size in Square Feet */}
              <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      1
                    </span>
                    <label
                      htmlFor={lawnSizeInputId}
                      className="text-base font-bold text-stone-900 tracking-tight"
                    >
                      Enter Lawn Size (Square Feet)
                    </label>
                  </div>
                  {lawnSizeStr !== "4500" && (
                    <button
                      onClick={handleReset}
                      className="text-xs text-stone-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                      title="Reset calculator"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>

                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                  Enter the approximate turf area. A standard suburban lot has about 3,500 to 6,000 sq ft of grass.
                </p>

                {/* Main Numeric Input */}
                <div className="relative mb-3">
                  <input
                    id={lawnSizeInputId}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="100"
                    value={lawnSizeStr}
                    onChange={(e) => setLawnSizeStr(e.target.value)}
                    placeholder="e.g. 4500"
                    className={`w-full text-xl sm:text-2xl font-bold font-mono tracking-tight px-4 py-3 bg-stone-50 border rounded-lg focus:outline-hidden focus:ring-2 transition-all ${
                      isValidSize
                        ? "border-stone-300 focus:border-emerald-700 focus:ring-emerald-700/20 text-stone-900"
                        : lawnSizeStr.trim() === ""
                        ? "border-stone-300 focus:border-emerald-700 focus:ring-emerald-700/20 text-stone-900"
                        : "border-red-300 focus:border-red-500 focus:ring-red-500/20 text-red-900"
                    }`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-500 bg-white border border-stone-200 px-2 py-1 rounded">
                    SQ FT
                  </div>
                </div>

                {/* Slider for intuitive adjustments on phone/desktop */}
                <div className="mb-4 pt-1">
                  <div className="flex justify-between text-[11px] text-stone-400 font-mono mb-1">
                    <span>500 sq ft</span>
                    <span>10,000 sq ft</span>
                    <span>20,000+ sq ft</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="20000"
                    step="100"
                    value={isValidSize ? Math.min(parsedSize, 20000) : 4500}
                    onChange={(e) => setLawnSizeStr(e.target.value)}
                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                    aria-label="Lawn size slider"
                  />
                </div>

                {/* Preset Yard Quick Selectors */}
                <div>
                  <span className="text-[11px] font-semibold uppercase text-stone-500 tracking-wider block mb-2">
                    Quick Yard Presets:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRICING_CONFIG.presets.map((preset) => {
                      const isSelected = parsedSize === preset.sqft;
                      return (
                        <button
                          key={preset.sqft}
                          type="button"
                          onClick={() => setLawnSizeStr(preset.sqft.toString())}
                          className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                            isSelected
                              ? "border-emerald-700 bg-emerald-50 text-emerald-950 font-semibold shadow-2xs"
                              : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                          }`}
                        >
                          <span className="block truncate">{preset.label}</span>
                          <span className="font-mono text-[11px] text-stone-500">
                            {formatNumber(preset.sqft)} sq ft
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Step 2: Service Selection (Mow, Mow and Edge, Full Cleanup) */}
              <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    2
                  </span>
                  <h2 className="text-base font-bold text-stone-900 tracking-tight">
                    Pick a Primary Service
                  </h2>
                </div>
                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                  Choose the level of regular care your turf requires. Each service has a square footage rate with a transparent minimum visit fee.
                </p>

                <div className="space-y-3">
                  {PRICING_CONFIG.services.map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    const calculatedPrice = isValidSize
                      ? Math.max(
                          parsedSize * service.ratePerSqFt,
                          service.minimumPrice
                        )
                      : null;

                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-emerald-700 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-700/30"
                            : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "border-emerald-700 bg-emerald-700 text-white"
                                  : "border-stone-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-stone-900 text-sm sm:text-base">
                                  {service.name}
                                </span>
                                {service.badge && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                                    {service.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                                {service.description}
                              </p>
                              <div className="text-[11px] text-stone-500 font-mono mt-1.5 flex items-center gap-2">
                                <span>${service.ratePerSqFt.toFixed(3)}/sq ft</span>
                                <span aria-hidden="true">·</span>
                                <span>${service.minimumPrice.toFixed(0)} min</span>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic price preview for this option */}
                          <div className="text-right shrink-0">
                            {calculatedPrice !== null ? (
                              <div>
                                <span className="text-base sm:text-lg font-bold font-mono text-emerald-900 block tabular-nums">
                                  {formatCurrency(calculatedPrice)}
                                </span>
                                <span className="text-[10px] text-stone-400">
                                  per visit
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-stone-400 font-mono italic">
                                --
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Step 3: Optional Add-ons (Bag the clippings, Weed treatment, etc.) */}
              <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    3
                  </span>
                  <h2 className="text-base font-bold text-stone-900 tracking-tight">
                    Optional Add-ons & Treatments
                  </h2>
                </div>
                <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                  Enhance your service visit. Check any optional add-ons to add to this estimate.
                </p>

                <div className="space-y-3">
                  {PRICING_CONFIG.addons.map((addon) => {
                    const isChecked = selectedAddonIds.includes(addon.id);
                    const calculatedAddonPrice = isValidSize
                      ? Math.max(
                          parsedSize * addon.ratePerSqFt,
                          addon.minimumPrice
                        )
                      : null;

                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`relative p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "border-emerald-700 bg-emerald-50/40 shadow-2xs"
                            : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                isChecked
                                  ? "border-emerald-700 bg-emerald-700 text-white"
                                  : "border-stone-300 bg-white"
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <span className="font-semibold text-stone-900 text-sm block">
                                {addon.name}
                              </span>
                              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                                {addon.description}
                              </p>
                              <div className="text-[11px] text-stone-500 font-mono mt-1 flex items-center gap-2">
                                <span>${addon.ratePerSqFt.toFixed(3)}/sq ft</span>
                                <span aria-hidden="true">·</span>
                                <span>${addon.minimumPrice.toFixed(0)} min</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {calculatedAddonPrice !== null ? (
                              <span
                                className={`text-sm sm:text-base font-bold font-mono block tabular-nums ${
                                  isChecked ? "text-emerald-900" : "text-stone-500"
                                }`}
                              >
                                +{formatCurrency(calculatedAddonPrice)}
                              </span>
                            ) : (
                              <span className="text-xs text-stone-400 font-mono italic">
                                --
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Column: Instant Price Estimate Breakdown & Summary (5 cols on lg) */}
            <div className="lg:col-span-5 sticky top-20 space-y-4">
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-stone-900 text-white p-5 border-b border-stone-800">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Live Estimate Breakdown
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      Single Visit Quote
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {PRICING_CONFIG.business.name}
                  </h3>
                </div>

                {/* Body Content */}
                <div className="p-5">
                  {!isValidSize ? (
                    /* Rule 3: Friendly message when lawn size is empty or not positive */
                    <div className="py-8 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                        <Info className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-stone-900 mb-1">
                        Please enter your lawn size
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-600 max-w-xs mx-auto leading-relaxed mb-4">
                        {lawnSizeStr.trim() !== "" && parsedSize <= 0
                          ? "Lawn size must be a positive number greater than 0 square feet."
                          : "Type in your estimated square footage or tap any quick preset above to generate your instant line-by-line price estimate."}
                      </p>
                      <button
                        type="button"
                        onClick={() => setLawnSizeStr("4500")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                      >
                        Try with sample yard (4,500 sq ft)
                      </button>
                    </div>
                  ) : (
                    /* Line-by-line breakdown */
                    <div className="space-y-4">
                      {/* Specs Row */}
                      <div className="flex items-center justify-between text-xs py-2 px-3 bg-stone-50 rounded-lg border border-stone-100 text-stone-600">
                        <span>Property Turf Size</span>
                        <span className="font-mono font-bold text-stone-900">
                          {formatNumber(parsedSize)} sq ft
                        </span>
                      </div>

                      {/* Line Items */}
                      <div className="space-y-3 divide-y divide-stone-100">
                        {/* Service Item */}
                        <div className="pt-2 first:pt-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-semibold text-stone-900 text-sm">
                                {selectedService.name}
                              </div>
                              <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                                {servicePriceInfo.isMinApplied ? (
                                  <span className="text-amber-700">
                                    Base minimum charge applied (${selectedService.minimumPrice.toFixed(2)} min)
                                  </span>
                                ) : (
                                  <span>
                                    {formatNumber(parsedSize)} sq ft × ${selectedService.ratePerSqFt.toFixed(3)}/sq ft
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-bold font-mono text-stone-900 text-sm tabular-nums">
                              {formatCurrency(servicePriceInfo.final)}
                            </span>
                          </div>
                        </div>

                        {/* Add-on Items */}
                        {addonsPriceInfo.map((addon) => (
                          <div key={addon.id} className="pt-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold text-stone-900 text-sm">
                                  {addon.name}
                                </div>
                                <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                                  {addon.isMinApplied ? (
                                    <span className="text-amber-700">
                                      Base minimum charge applied (${addon.minimumPrice.toFixed(2)} min)
                                    </span>
                                  ) : (
                                    <span>
                                      {formatNumber(parsedSize)} sq ft × ${addon.ratePerSqFt.toFixed(3)}/sq ft
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-bold font-mono text-stone-900 text-sm tabular-nums">
                                {formatCurrency(addon.final)}
                              </span>
                            </div>
                          </div>
                        ))}

                        {addonsPriceInfo.length === 0 && (
                          <div className="pt-2 text-xs text-stone-400 italic">
                            No optional add-ons selected
                          </div>
                        )}
                      </div>

                      {/* Separator */}
                      <div className="border-t border-stone-200 pt-3">
                        {/* Total Row */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-stone-500 font-bold block">
                              Total Estimate
                            </span>
                            <span className="text-[11px] text-stone-400">
                              Single visit • Tax included
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-950 block tabular-nums">
                              {formatCurrency(totalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-2 space-y-2">
                        {/* Copy Quote Button (Rule 2) */}
                        <button
                          type="button"
                          onClick={handleCopyQuote}
                          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                            copied
                              ? "bg-emerald-800 text-white shadow-xs"
                              : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs hover:shadow-sm"
                          }`}
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                              <span>Quote Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Quote Breakdown</span>
                            </>
                          )}
                        </button>

                        {/* Phone booking contact */}
                        <a
                          href={`tel:${PRICING_CONFIG.business.phone.replace(/[^0-9]/g, "")}`}
                          className="w-full py-2.5 px-4 rounded-lg font-medium text-xs sm:text-sm text-stone-700 bg-stone-100 hover:bg-stone-200 flex items-center justify-center gap-2 transition-colors"
                        >
                          <Phone className="w-4 h-4 text-emerald-700" />
                          <span>Call to Schedule ({PRICING_CONFIG.business.phone})</span>
                        </a>
                      </div>

                      {/* Guarantee Trust Marker */}
                      <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>{PRICING_CONFIG.business.guarantee}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Helpful Sizing Reference Box */}
              <div className="p-4 rounded-xl bg-emerald-900/5 border border-emerald-900/10 text-xs text-stone-700 space-y-1.5">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>How We Calculate Your Lawn Size</span>
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Roughly multiply the length and width of your yard in paces (1 pace ≈ 3 feet), then subtract your home's footprint. We verify with a quick satellite measure before our initial visit.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Transparent Rate Sheet View */
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-stone-900 mb-2">
                Published Business Pricing Rates
              </h2>
              <p className="text-sm text-stone-600 mb-6">
                All pricing rules are defined transparently at the top of the codebase in the easy-to-edit configuration object. Here is the current rate card for residential properties.
              </p>

              {/* Service Rates Table */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">
                  1. Primary Lawn Services
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500">
                        <th className="py-2.5 font-semibold">Service</th>
                        <th className="py-2.5 font-semibold">Rate per Sq Ft</th>
                        <th className="py-2.5 font-semibold">Minimum Fee</th>
                        <th className="py-2.5 font-semibold">Includes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-mono">
                      {PRICING_CONFIG.services.map((service) => (
                        <tr key={service.id} className="hover:bg-stone-50">
                          <td className="py-3 font-sans font-semibold text-stone-900">
                            {service.name}
                          </td>
                          <td className="py-3 text-emerald-800 font-bold">
                            ${service.ratePerSqFt.toFixed(3)}
                          </td>
                          <td className="py-3 text-stone-700">
                            ${service.minimumPrice.toFixed(2)}
                          </td>
                          <td className="py-3 font-sans text-xs text-stone-500 max-w-xs">
                            {service.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add-ons Rates Table */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">
                  2. Optional Add-ons & Treatments
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500">
                        <th className="py-2.5 font-semibold">Add-on Item</th>
                        <th className="py-2.5 font-semibold">Rate per Sq Ft</th>
                        <th className="py-2.5 font-semibold">Minimum Fee</th>
                        <th className="py-2.5 font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-mono">
                      {PRICING_CONFIG.addons.map((addon) => (
                        <tr key={addon.id} className="hover:bg-stone-50">
                          <td className="py-3 font-sans font-semibold text-stone-900">
                            {addon.name}
                          </td>
                          <td className="py-3 text-emerald-800 font-bold">
                            ${addon.ratePerSqFt.toFixed(3)}
                          </td>
                          <td className="py-3 text-stone-700">
                            ${addon.minimumPrice.toFixed(2)}
                          </td>
                          <td className="py-3 font-sans text-xs text-stone-500 max-w-xs">
                            {addon.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculation Rule Explanation */}
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 space-y-2">
                <span className="font-bold text-stone-800 block">
                  How Estimates Are Calculated:
                </span>
                <p>
                  For each service or add-on, the price equals the lawn square footage multiplied by the rate per square foot. If the result is lower than the minimum price, the minimum price applies.
                </p>
                <p className="font-mono text-stone-700 bg-white p-2 rounded border border-stone-200">
                  Item Price = Math.max(Lawn Size × Rate per Sq Ft, Minimum Price)
                </p>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveTab("calculator")}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors"
                >
                  Return to Quote Calculator
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-200 bg-white py-8 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-stone-800">
              {PRICING_CONFIG.business.name}
            </span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>{PRICING_CONFIG.business.serviceArea}</span>
          </div>
          <div className="flex items-center gap-4 text-stone-600">
            <a
              href={`tel:${PRICING_CONFIG.business.phone.replace(/[^0-9]/g, "")}`}
              className="hover:text-emerald-800 transition-colors"
            >
              {PRICING_CONFIG.business.phone}
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={`mailto:${PRICING_CONFIG.business.email}`}
              className="hover:text-emerald-800 transition-colors"
            >
              {PRICING_CONFIG.business.email}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
