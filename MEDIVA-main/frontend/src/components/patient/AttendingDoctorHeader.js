import React from "react";
import { Phone, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/format";

export default function AttendingDoctorHeader({ doctor }) {
  const profile = doctor?.profile;
  const dp = doctor?.doctor;
  const specialty = dp?.custom_specialty_name || doctor?.specialty?.name || "Specialist";
  const phone = dp?.clinic_phone_number || "+91 123456789";
  const telHref = `tel:${phone.replace(/\s/g, "")}`;

  return (
    <div
      className="sticky top-0 z-20 -mx-4 mb-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:shadow-sm"
      data-testid="patient-attending-doctor-card"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {initials(profile?.full_name || "Dr")}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
              {profile?.full_name || "Your Doctor"}
              <BadgeCheck className="h-4 w-4 text-sky-600" />
            </div>
            <div className="truncate text-xs text-slate-500">
              {specialty}
              {dp?.years_of_experience ? ` · ${dp.years_of_experience} yrs exp` : ""}
            </div>
          </div>
        </div>
        <a href={telHref} data-testid="patient-call-doctor-button">
          <Button className="h-10 bg-sky-600 hover:bg-sky-700">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Call</span>
          </Button>
        </a>
      </div>
    </div>
  );
}
