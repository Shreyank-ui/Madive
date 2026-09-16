{
  "product": {
    "name": "MEDIVA AI",
    "design_personality": [
      "Enterprise Clinical Authority",
      "calm + precise",
      "trustworthy, low-cognitive-load for patients",
      "dense, scannable cockpit for clinicians"
    ],
    "audiences": {
      "patient": {
        "goals": [
          "log in quickly",
          "book via symptom triage without anxiety",
          "see meds + next steps at a glance",
          "complete 45s check-in and understand triage result"
        ],
        "ui_principles": [
          "mobile-first, large tap targets",
          "progressive disclosure (show 1 primary action per card)",
          "reassuring language + clear status badges",
          "avoid dense tables; prefer cards + short lists"
        ]
      },
      "clinician": {
        "goals": [
          "scan today’s workload fast",
          "open consultation modal in 1 click",
          "manage surgery schedule + stock expiry",
          "triage feed: sort, filter, act"
        ],
        "ui_principles": [
          "desktop/tablet first",
          "high information density with strong hierarchy",
          "tables + tabs + keyboard-friendly command patterns",
          "fast actions always visible (row actions, sticky header)"
        ]
      }
    }
  },

  "mandatory_theme_tokens": {
    "background_canvas": {
      "hex": "#F8FAFC",
      "tailwind": "bg-slate-50",
      "rule": "Use on ALL screens as the page canvas. Cards are white."
    },
    "surface": {
      "card_bg": "#FFFFFF",
      "border": "#E2E8F0",
      "tailwind": "bg-white border-slate-200",
      "shadow": "shadow-sm (optionally shadow-slate-900/5)"
    },
    "primary_brand": {
      "hex": "#0F2942",
      "tailwind": "text-slate-900 bg-slate-900",
      "usage": "Primary headings, top bars, key labels."
    },
    "interactive_accents": {
      "cyan": "#0284C7",
      "sky": "#0EA5E9",
      "tailwind": "bg-sky-600 hover:bg-sky-700 text-white",
      "usage": "Primary CTAs, links, focus rings, active tab underline."
    },
    "triage_alerts": {
      "critical_red": {
        "bg": "#FFF1F2",
        "text": "#BE123C",
        "border": "rose-500",
        "tailwind": "bg-rose-50 text-rose-700 border-rose-500"
      },
      "watch_yellow": {
        "bg": "#FFFBEB",
        "text": "#B45309",
        "border": "amber-500",
        "tailwind": "bg-amber-50 text-amber-700 border-amber-500"
      },
      "safe_green": {
        "bg": "#ECFDF5",
        "text": "#047857",
        "border": "emerald-500",
        "tailwind": "bg-emerald-50 text-emerald-700 border-emerald-500"
      }
    },
    "gradient_policy": {
      "allowed": "Avoid gradients entirely for this enterprise clinical product unless used as a very subtle decorative header wash (<20% viewport).",
      "note": "Given the mandatory palette and clinical tone, prefer solid slate-50 canvas + white cards."
    }
  },

  "typography": {
    "font_pairing": {
      "primary_ui": {
        "google_font": "IBM Plex Sans",
        "fallback": "ui-sans-serif, system-ui",
        "why": "Reads as clinical/enterprise; excellent numerals for vitals and timers."
      },
      "data_mono_optional": {
        "google_font": "IBM Plex Mono",
        "usage": "Optional for IDs, MRN, lot numbers, expiry dates in clinician tables."
      }
    },
    "tailwind_application": {
      "body": "font-sans text-slate-900",
      "muted": "text-slate-600",
      "caption": "text-slate-500"
    },
    "type_scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900",
      "h2": "text-base md:text-lg font-medium text-slate-700",
      "section_title": "text-lg font-semibold text-slate-900",
      "card_title": "text-base font-semibold text-slate-900",
      "body": "text-sm md:text-base leading-6 text-slate-700",
      "small": "text-xs text-slate-500"
    },
    "numerals": {
      "rule": "Use tabular numerals for countdowns, vitals, adherence percentages.",
      "tailwind": "[font-variant-numeric:tabular-nums]"
    }
  },

  "layout_and_spacing": {
    "global_container": {
      "patient_mobile": "px-4 py-4 max-w-md mx-auto (only for content width; do not center-align text)",
      "doctor_desktop": "px-6 py-6 max-w-[1400px] mx-auto",
      "rule": "Canvas is slate-50; content sits in a left-aligned flow."
    },
    "grid_system": {
      "patient_dashboard": "Single column on mobile; at md: 2 columns (main + secondary) using grid grid-cols-1 md:grid-cols-3 gap-4 with main col-span-2.",
      "doctor_command_center": "At lg: 12-col grid. Left: roster/table (col-span-8). Right: triage feed/quick actions (col-span-4)."
    },
    "spacing_tokens": {
      "card_padding": "p-4 (mobile) / p-5 (desktop)",
      "section_gap": "space-y-4 (mobile) / space-y-6 (desktop)",
      "dense_table_rows": "py-2.5 px-3",
      "tap_targets": "min-h-11 (44px) for primary buttons and list rows"
    },
    "radius_and_shadow": {
      "radius": "rounded-xl for cards; rounded-lg for inputs; rounded-md for badges",
      "shadow": "shadow-sm shadow-slate-900/5; hover: shadow-md (subtle)"
    }
  },

  "component_library": {
    "primary": "shadcn/ui from /app/frontend/src/components/ui (JS files)",
    "component_path": {
      "button": "/app/frontend/src/components/ui/button.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "table": "/app/frontend/src/components/ui/table.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "drawer": "/app/frontend/src/components/ui/drawer.jsx",
      "calendar": "/app/frontend/src/components/ui/calendar.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "progress": "/app/frontend/src/components/ui/progress.jsx",
      "slider": "/app/frontend/src/components/ui/slider.jsx",
      "select": "/app/frontend/src/components/ui/select.jsx",
      "textarea": "/app/frontend/src/components/ui/textarea.jsx",
      "input": "/app/frontend/src/components/ui/input.jsx",
      "checkbox": "/app/frontend/src/components/ui/checkbox.jsx",
      "sonner_toast": "/app/frontend/src/components/ui/sonner.jsx"
    },
    "icons": {
      "library": "lucide-react",
      "rule": "Use consistent stroke width (default) and size: 18–20px in patient UI, 16px in dense clinician tables."
    }
  },

  "core_patterns": {
    "page_shell": {
      "patient": {
        "header": {
          "pattern": "Attending doctor header card with avatar + name + specialty + call button.",
          "tailwind": "bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3",
          "call_button": "Use Button variant=default with bg-sky-600 hover:bg-sky-700; include phone icon; min-h-11",
          "data_testids": [
            "patient-attending-doctor-card",
            "patient-call-doctor-button"
          ]
        }
      },
      "doctor": {
        "topbar": {
          "pattern": "Compact top bar with app name, facility selector, global search, profile.",
          "tailwind": "sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200",
          "data_testids": [
            "doctor-topbar",
            "doctor-global-search-input"
          ]
        }
      }
    },

    "cards": {
      "base": {
        "tailwind": "bg-white border border-slate-200 rounded-xl shadow-sm",
        "header": "px-4 pt-4 pb-2",
        "content": "px-4 pb-4",
        "hover": "hover:shadow-md hover:shadow-slate-900/5 (only on clickable cards)",
        "focus": "focus-within:ring-2 focus-within:ring-sky-200 focus-within:ring-offset-2 focus-within:ring-offset-slate-50"
      },
      "clickable_card_rule": "If the whole card is clickable, add cursor-pointer and a visible focus ring on keyboard focus."
    },

    "tabs": {
      "doctor_command_center_tabs": {
        "pattern": "4 tabs: Today, Surgery Board, Stock & Expiry, Recovery Triage.",
        "style": "Underline active tab with sky-600; inactive text slate-600; keep tabs compact.",
        "tailwind": {
          "list": "bg-white border border-slate-200 rounded-xl p-1",
          "trigger": "data-[state=active]:bg-slate-50 data-[state=active]:text-slate-900 data-[state=active]:shadow-none",
          "active_indicator": "Use a bottom border or subtle inset ring: data-[state=active]:ring-1 data-[state=active]:ring-sky-200"
        },
        "data_testids": [
          "doctor-command-center-tabs",
          "doctor-tab-today",
          "doctor-tab-surgery",
          "doctor-tab-stock",
          "doctor-tab-triage"
        ]
      }
    },

    "tables": {
      "clinician_density": {
        "pattern": "Use shadcn Table with sticky header for rosters; row hover highlight; right-aligned actions.",
        "tailwind": {
          "table_wrapper": "bg-white border border-slate-200 rounded-xl overflow-hidden",
          "thead": "bg-slate-50",
          "th": "text-xs font-semibold text-slate-600 uppercase tracking-wide",
          "tr": "hover:bg-slate-50",
          "td": "text-sm text-slate-700",
          "row_actions": "flex items-center justify-end gap-2"
        },
        "data_testids": [
          "doctor-appointments-table",
          "doctor-surgery-table",
          "doctor-stock-table",
          "doctor-triage-table"
        ]
      }
    },

    "modals_drawers": {
      "patient": {
        "pattern": "Use Drawer for mobile-first flows (reschedule, check-in, triage details).",
        "tailwind": "rounded-t-2xl",
        "data_testids": [
          "patient-reschedule-drawer",
          "patient-checkin-drawer"
        ]
      },
      "doctor": {
        "pattern": "Use Dialog for consultation modal and surgery details on desktop.",
        "tailwind": "max-w-3xl",
        "data_testids": [
          "doctor-consultation-dialog",
          "doctor-surgery-detail-dialog"
        ]
      }
    }
  },

  "triage_badges_and_results": {
    "badge_component": "Use shadcn Badge but override className per status.",
    "exact_styles": {
      "critical": "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border-rose-500",
      "watch": "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border-amber-500",
      "safe": "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-500"
    },
    "result_panel": {
      "pattern": "After check-in, show a result card with icon + headline + 2 bullet next steps + CTA.",
      "tailwind": "bg-white border border-slate-200 rounded-xl p-4 shadow-sm",
      "headline": "text-base font-semibold text-slate-900",
      "cta": "Primary Button sky-600; secondary ghost for ‘View details’.",
      "data_testids": [
        "patient-triage-result-card",
        "patient-triage-result-status-badge",
        "patient-triage-result-primary-cta"
      ]
    }
  },

  "patient_dashboard_components": {
    "medicine_reminder_system": {
      "card": {
        "pattern": "One medicine per card: name, dosage, next dose countdown, checklist, adherence bar.",
        "tailwind": "bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3",
        "data_testids": [
          "patient-medicine-reminder-card"
        ]
      },
      "countdown": {
        "pattern": "Large, calm timer with tabular numerals; avoid alarm styling.",
        "tailwind": "text-2xl font-semibold text-slate-900 [font-variant-numeric:tabular-nums]",
        "support_text": "text-xs text-slate-500",
        "data_testids": [
          "patient-next-dose-countdown"
        ]
      },
      "dose_checklist": {
        "pattern": "Use Checkbox rows for ‘Taken’ with timestamp; keep row height >= 44px.",
        "tailwind": "flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5",
        "checkbox": "Use shadcn Checkbox; label text-sm text-slate-700",
        "data_testids": [
          "patient-dose-checklist-item"
        ]
      },
      "adherence_bar": {
        "pattern": "Use Progress with semantic color based on adherence % (not triage).",
        "rules": [
          "0–49%: use amber tone",
          "50–79%: use sky tone",
          "80–100%: use emerald tone"
        ],
        "tailwind": {
          "wrapper": "space-y-1",
          "label_row": "flex items-center justify-between text-xs text-slate-500",
          "progress": "h-2 bg-slate-100",
          "indicator": "bg-sky-600 (swap to bg-amber-500 or bg-emerald-600 by rule)"
        },
        "data_testids": [
          "patient-adherence-progress",
          "patient-adherence-percentage"
        ]
      }
    },

    "ehr_record_card": {
      "pattern": "EHR summary card: last visit, prescriptions list, follow-up CTA opens reschedule calendar modal.",
      "prescriptions": "Use compact list with Separator between items; show prescriber + date in muted text.",
      "reschedule": {
        "component": "shadcn Calendar inside Dialog/Drawer",
        "calendar_tailwind": "rounded-xl border border-slate-200 bg-white p-3",
        "data_testids": [
          "patient-ehr-card",
          "patient-prescriptions-list",
          "patient-reschedule-button",
          "patient-reschedule-calendar"
        ]
      }
    },

    "45s_health_checkin_form": {
      "pattern": "Single-screen form with sections; show completion meter; submit yields triage result.",
      "structure": [
        "Pain slider",
        "Temperature input",
        "Symptom tags (toggle group)",
        "Photo upload",
        "Submit"
      ],
      "completion_meter": {
        "component": "Progress",
        "tailwind": "h-2 bg-slate-100",
        "data_testids": [
          "patient-checkin-completion-progress"
        ]
      },
      "pain_slider": {
        "component": "shadcn Slider",
        "styling": {
          "track": "h-2 bg-slate-200 rounded-full",
          "range": "bg-sky-600",
          "thumb": "h-5 w-5 bg-white border border-slate-300 shadow-sm focus-visible:ring-2 focus-visible:ring-sky-200"
        },
        "labels": "0 (No pain) — 10 (Worst)",
        "data_testids": [
          "patient-pain-slider"
        ]
      },
      "temperature": {
        "component": "Input",
        "tailwind": "h-11",
        "data_testids": [
          "patient-temperature-input"
        ]
      },
      "symptom_tags": {
        "component": "toggle-group",
        "tailwind": "flex flex-wrap gap-2",
        "tag": "rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 data-[state=on]:border-sky-300 data-[state=on]:bg-sky-50 data-[state=on]:text-slate-900",
        "data_testids": [
          "patient-symptom-tags"
        ]
      },
      "photo_upload": {
        "pattern": "Use Input type=file with helper text; show thumbnail preview in AspectRatio.",
        "tailwind": "rounded-xl border border-dashed border-slate-300 bg-white p-4",
        "data_testids": [
          "patient-photo-upload-input",
          "patient-photo-preview"
        ]
      },
      "submit": {
        "component": "Button",
        "tailwind": "w-full h-11 bg-sky-600 hover:bg-sky-700",
        "data_testids": [
          "patient-checkin-submit-button"
        ]
      }
    }
  },

  "doctor_command_center_components": {
    "today_appointments_roster": {
      "pattern": "Table with filters (Select), search (Input), and quick actions per row.",
      "filters_bar": "flex flex-col md:flex-row gap-2 md:items-center md:justify-between",
      "row_actions": [
        "Open consultation (Dialog)",
        "Mark arrived",
        "Send message"
      ],
      "data_testids": [
        "doctor-appointments-filters",
        "doctor-appointments-search-input",
        "doctor-open-consultation-button"
      ]
    },
    "consultation_modal": {
      "pattern": "Dialog with left: patient summary + vitals; right: notes + orders.",
      "layout": "grid grid-cols-1 lg:grid-cols-2 gap-4",
      "notes": "Textarea with autosize optional; keep actions sticky at bottom.",
      "data_testids": [
        "doctor-consultation-notes-textarea",
        "doctor-consultation-save-button"
      ]
    },
    "surgery_schedule_board": {
      "pattern": "Board-like list grouped by OR / time blocks; use Collapsible for each surgery.",
      "status_badges": "Use triage badge styles for risk/priority only; otherwise use neutral badges (slate).",
      "data_testids": [
        "doctor-surgery-board",
        "doctor-surgery-item"
      ]
    },
    "medicine_stock_expiry_manager": {
      "pattern": "Sortable table default sort by expiry ascending; highlight rows nearing expiry.",
      "expiry_highlight": {
        "<30_days": "bg-amber-50",
        "expired": "bg-rose-50"
      },
      "data_testids": [
        "doctor-stock-sort-expiry-button",
        "doctor-stock-expiry-badge"
      ]
    },
    "interim_recovery_triage_feed": {
      "pattern": "Right-side feed of check-ins; each item shows patient, timestamp, triage badge, quick actions.",
      "item_tailwind": "bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:bg-slate-50",
      "actions": "Button size=sm for ‘Review’ and ghost for ‘Dismiss’.",
      "data_testids": [
        "doctor-triage-feed",
        "doctor-triage-feed-item",
        "doctor-triage-review-button"
      ]
    }
  },

  "states_and_feedback": {
    "loading": {
      "component": "Skeleton",
      "pattern": "Use skeleton blocks inside cards; avoid spinners for long lists.",
      "tailwind": "bg-slate-100",
      "data_testids": [
        "loading-skeleton"
      ]
    },
    "empty": {
      "pattern": "Calm empty state with icon + 1 sentence + primary action.",
      "tailwind": "bg-white border border-slate-200 rounded-xl p-6 text-center",
      "copy_tone": "Reassuring, non-alarming. Example: ‘No reminders due right now.’",
      "data_testids": [
        "empty-state"
      ]
    },
    "error": {
      "component": "Alert",
      "pattern": "Use Alert with rose-50 styling; include retry button.",
      "tailwind": "bg-rose-50 border border-rose-200 text-rose-800",
      "data_testids": [
        "error-alert",
        "error-retry-button"
      ]
    },
    "toasts": {
      "library": "sonner",
      "usage": "Use for non-blocking confirmations (saved, reminder marked taken).",
      "tone": "Short, factual. Avoid playful language.",
      "data_testids": [
        "toast"
      ]
    }
  },

  "motion_and_microinteractions": {
    "principles": [
      "Trustworthy > playful: no bouncy easing, no exaggerated scaling",
      "Prefer 120–180ms for hover/focus, 180–240ms for dialogs/drawers",
      "Use subtle elevation + background tint on hover",
      "Respect prefers-reduced-motion"
    ],
    "tailwind_recipes": {
      "button": "transition-colors duration-150",
      "clickable_card": "transition-shadow duration-200",
      "row_hover": "transition-colors duration-150",
      "drawer_dialog": "Use shadcn defaults; avoid custom global transitions"
    },
    "optional_library": {
      "name": "framer-motion",
      "when": "Only if you need animated triage result reveal or adherence bar count-up.",
      "install": "npm i framer-motion",
      "usage_note": "Keep animations subtle (opacity + y: 6px). Do not animate layout aggressively."
    }
  },

  "accessibility": {
    "contrast": "All text on slate-50/white must be slate-700+; primary actions sky-600 with white text.",
    "focus": "Always visible focus ring: focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50",
    "touch": "Min 44px height for primary interactive elements.",
    "aria": "Dialogs/Drawers must have titles; inputs must have labels.",
    "reduced_motion": "Disable non-essential animations when prefers-reduced-motion is enabled."
  },

  "implementation_notes_for_js": {
    "routing": "Use react-router-dom layouts: PatientLayout and DoctorLayout with shared tokens.",
    "data_testid_rule": "Every button/link/input/tab trigger/table row action must include data-testid in kebab-case describing role.",
    "example": {
      "button": "<Button data-testid=\"patient-checkin-submit-button\" className=\"h-11 bg-sky-600 hover:bg-sky-700\">Submit</Button>",
      "input": "<Input data-testid=\"doctor-appointments-search-input\" placeholder=\"Search patients\" className=\"h-11\" />"
    }
  },

  "image_urls": {
    "rule": "Prefer minimal imagery in enterprise clinical apps. Use icons + whitespace. If imagery is needed, use subtle, non-graphic hospital photography.",
    "categories": [
      {
        "category": "login_background_optional",
        "description": "Very subtle, blurred hospital corridor image behind a white login card (keep readability).",
        "urls": []
      },
      {
        "category": "patient_dashboard_header_optional",
        "description": "Small doctor portrait avatars (can be initials fallback).",
        "urls": []
      }
    ]
  },

  "instructions_to_main_agent": [
    "Replace CRA default App.css centered header styles; do NOT center the app container globally.",
    "Set body background to slate-50 via Tailwind (bg-slate-50) and ensure cards are bg-white with border-slate-200.",
    "Implement two shells: Patient (mobile-first cards) and Doctor (desktop cockpit with Tabs + Tables).",
    "Use shadcn Drawer for patient modals on mobile; Dialog for doctor modals on desktop.",
    "Implement triage badges EXACTLY with the provided tailwind classes; reuse across patient check-in result and clinician triage feed.",
    "Medicine reminder: countdown uses tabular numerals; adherence uses Progress with semantic colors.",
    "Pain slider: use shadcn Slider with sky-600 range and white thumb; label endpoints.",
    "All interactive and key informational elements MUST include data-testid attributes (kebab-case).",
    "Avoid gradients except possibly a tiny decorative header wash; keep the clinical slate canvas dominant."
  ]
}

---

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
