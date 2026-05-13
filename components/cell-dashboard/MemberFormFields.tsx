"use client";

import type { ReactNode } from "react";
import type { FoundationSchoolId, MemberRosterStatus } from "@/lib/members-store";
import {
  IconActivity,
  IconBriefcase,
  IconCalendar,
  IconGraduationCap,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUser,
} from "./icons";
import type { MemberFormValues } from "./member-form-values";

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-neutral-800">{children}</label>
  );
}

function InputShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-lg border border-neutral-200 bg-white focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-900/10 ${className}`}
    >
      {children}
    </div>
  );
}

const foundationOptions: { id: FoundationSchoolId; label: string }[] = [
  { id: "yet_to_start", label: "Yet to Start" },
  { id: "started", label: "Started" },
  { id: "completed", label: "Completed" },
];

const memberStatusOptions: {
  id: MemberRosterStatus;
  label: string;
  dotClass: string;
}[] = [
  { id: "active", label: "Active", dotClass: "bg-emerald-500" },
  { id: "inactive", label: "Inactive", dotClass: "bg-amber-500" },
  { id: "dormant", label: "Dormant", dotClass: "bg-red-500" },
];

type MemberFormFieldsProps = {
  /** Unique prefix so radio groups don’t clash if two forms mount */
  formInstanceId: string;
  values: MemberFormValues;
  onChange: (patch: Partial<MemberFormValues>) => void;
};

export function MemberFormFields({
  formInstanceId,
  values,
  onChange,
}: MemberFormFieldsProps) {
  const fName = `foundation-${formInstanceId}`;
  const sName = `memberStatus-${formInstanceId}`;

  return (
    <div className="w-full max-w-full py-6 pb-8 lg:py-8 lg:pb-10">
      <section className="mb-10">
        <div className="mb-6 flex items-center gap-2 text-base font-semibold text-neutral-900">
          <IconUser className="h-5 w-5 shrink-0 text-[#0B0E14]" />
          Basic Information
        </div>
        <div className="space-y-5">
          <div>
            <FieldLabel>Full Name *</FieldLabel>
            <input
              type="text"
              autoComplete="name"
              placeholder="Enter full name"
              value={values.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-900/10"
            />
          </div>
          <div>
            <FieldLabel>Contact / Email *</FieldLabel>
            <InputShell>
              <span className="flex items-center border-r border-neutral-100 px-3 text-neutral-400">
                <IconMail />
              </span>
              <input
                type="email"
                autoComplete="email"
                placeholder="email@example.com"
                value={values.email}
                onChange={(e) => onChange({ email: e.target.value })}
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400"
              />
            </InputShell>
          </div>
          <div>
            <FieldLabel>Phone number</FieldLabel>
            <InputShell>
              <span className="flex items-center border-r border-neutral-100 px-3 text-neutral-400">
                <IconPhone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="e.g. +1 234 567 8900"
                value={values.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400"
              />
            </InputShell>
          </div>
          <div>
            <FieldLabel>Date of Birth *</FieldLabel>
            <InputShell>
              <span className="flex items-center border-r border-neutral-100 px-3 text-neutral-400">
                <IconCalendar />
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="mm / dd / yyyy"
                value={values.dateOfBirth}
                onChange={(e) => onChange({ dateOfBirth: e.target.value })}
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400"
              />
              <span className="flex items-center border-l border-neutral-100 px-3 text-neutral-400">
                <IconCalendar />
              </span>
            </InputShell>
          </div>
          <div>
            <FieldLabel>Area / Residence *</FieldLabel>
            <InputShell>
              <span className="flex items-center border-r border-neutral-100 px-3 text-neutral-400">
                <IconMapPin />
              </span>
              <input
                type="text"
                autoComplete="street-address"
                placeholder="Enter area or residence"
                value={values.area}
                onChange={(e) => onChange({ area: e.target.value })}
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400"
              />
            </InputShell>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-6 flex items-center gap-2 text-base font-semibold text-neutral-900">
          <IconBriefcase className="h-5 w-5 shrink-0 text-[#0B0E14]" />
          Occupation
        </div>
        <label className="mb-5 flex cursor-pointer items-center gap-3 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={values.isStudent}
            onChange={(e) => onChange({ isStudent: e.target.checked })}
            className="h-4 w-4 rounded border-neutral-300 text-[#0B0E14] accent-[#2563eb]"
          />
          Member is a student
        </label>
        <div>
          <FieldLabel>Occupation *</FieldLabel>
          <InputShell>
            <span className="flex items-center border-r border-neutral-100 px-3 text-neutral-400">
              <IconBriefcase />
            </span>
            <input
              type="text"
              placeholder="e.g., Software Engineer"
              value={values.occupation}
              onChange={(e) => onChange({ occupation: e.target.value })}
              className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400"
            />
          </InputShell>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2 text-base font-semibold text-neutral-900">
          <IconGraduationCap className="h-5 w-5 shrink-0 text-[#0B0E14]" />
          Foundation School Status
        </div>
        <div className="flex flex-col gap-3">
          {foundationOptions.map((opt) => {
            const checked = values.foundationStatus === opt.id;
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 text-sm touch-manipulation transition ${
                  checked
                    ? "border-neutral-300 bg-neutral-50"
                    : "border-neutral-200 bg-white hover:bg-neutral-50/80"
                }`}
              >
                <input
                  type="radio"
                  name={fName}
                  value={opt.id}
                  checked={checked}
                  onChange={() => onChange({ foundationStatus: opt.id })}
                  className="h-4 w-4 shrink-0 border-neutral-300 accent-[#2563eb]"
                />
                <span className="text-neutral-900">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2 text-base font-semibold text-neutral-900">
          <IconActivity className="h-5 w-5 shrink-0 text-[#0B0E14]" />
          Member Status
        </div>
        <div className="flex flex-col gap-3">
          {memberStatusOptions.map((opt) => {
            const checked = values.memberStatus === opt.id;
            let cardClass =
              "border-neutral-200 bg-white hover:bg-neutral-50/80";
            if (checked) {
              if (opt.id === "active") {
                cardClass = "border-emerald-500 bg-emerald-50/90";
              } else if (opt.id === "inactive") {
                cardClass = "border-amber-400 bg-amber-50/60";
              } else {
                cardClass = "border-rose-400 bg-rose-50/70";
              }
            }
            return (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 text-sm touch-manipulation transition ${cardClass}`}
              >
                <input
                  type="radio"
                  name={sName}
                  value={opt.id}
                  checked={checked}
                  onChange={() => onChange({ memberStatus: opt.id })}
                  className="h-4 w-4 shrink-0 border-neutral-300 accent-[#2563eb]"
                />
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${opt.dotClass}`}
                  aria-hidden
                />
                <span className="font-medium text-neutral-900">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
