"use client";

import React, { useState } from "react";
import { Pill, Phone, MapPin, CheckCircle2, AlertCircle, X, Truck, RefreshCw } from "lucide-react";
import { MedicationData, ProfileData } from "@/types";

interface PharmacyRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  medications: MedicationData[];
  onConfirmRefill: (medId: string, amount: number) => Promise<void>;
}

export default function PharmacyRefillModal({
  isOpen,
  onClose,
  profile,
  medications,
  onConfirmRefill,
}: PharmacyRefillModalProps) {
  const [selectedMedId, setSelectedMedId] = useState(medications[0]?.id || "");
  const [refillDays, setRefillDays] = useState(30);
  const [deliveryOption, setDeliveryOption] = useState<"HOME_DELIVERY" | "CURBSIDE">("HOME_DELIVERY");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const selectedMed = medications.find((m) => m.id === selectedMedId) || medications[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) return;

    setSubmitting(true);
    try {
      await onConfirmRefill(selectedMed.id, refillDays);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Pharmacy Prescription Refill</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pharmacy Info Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 text-xs space-y-1">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>{selectedMed?.refillPharmacy || "Walgreens Pharmacy #419"}</span>
            <span className="text-emerald-700">✓ In-Network Preferred</span>
          </div>
          <p className="text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>1200 Westlake Ave N, Seattle, WA</span>
          </p>
          <p className="text-blue-700 font-semibold flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-blue-500" />
            <span>{selectedMed?.pharmacyPhone || "+1 (555) 300-8800"}</span>
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700">Select Medication to Refill:</label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white"
              >
                {medications.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.dosage}) — {m.remainingPills} pills remaining
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700">Refill Quantity:</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setRefillDays(30)}
                    className={`py-2 rounded-xl font-bold border transition ${
                      refillDays === 30
                        ? "bg-indigo-50 border-indigo-600 text-indigo-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    30 Pills
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefillDays(90)}
                    className={`py-2 rounded-xl font-bold border transition ${
                      refillDays === 90
                        ? "bg-indigo-50 border-indigo-600 text-indigo-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    90 Pills
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Fulfillment Method:</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setDeliveryOption("HOME_DELIVERY")}
                    className={`py-2 rounded-xl font-bold border transition flex items-center justify-center gap-1 ${
                      deliveryOption === "HOME_DELIVERY"
                        ? "bg-emerald-50 border-emerald-600 text-emerald-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryOption("CURBSIDE")}
                    className={`py-2 rounded-xl font-bold border transition ${
                      deliveryOption === "CURBSIDE"
                        ? "bg-emerald-50 border-emerald-600 text-emerald-800"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Pickup
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
              💡 Automated Refill Protocol: This order will increment Eleanor&apos;s inventory upon fulfillment and notify primary nurse Elena Gomez.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${submitting ? "animate-spin" : ""}`} />
                <span>{submitting ? "Authorizing..." : "Submit Pharmacy Refill"}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Refill Order Dispatched to Walgreens!
            </h4>
            <p className="text-xs text-slate-600">
              +{refillDays} pills added to {selectedMed?.name} inventory. Delivery scheduled to Eleanor&apos;s residence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
