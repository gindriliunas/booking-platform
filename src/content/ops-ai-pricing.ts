/** Ops & AI engagement bands — Ops & AI landing (`/internal-systems`) */

export type OpsAiPricingTier = {
  name: string;
  tagline: string;
  summary: string;
  price: string;
  priceNote: string;
  duration: string;
  cta: string;
  highlight: boolean;
  items: string[];
  footnote: string;
};

export const opsAiPricingTiers: OpsAiPricingTier[] = [
  {
    name: "Kickstart",
    tagline: "Focused pilot",
    summary: "Ship something real on a bounded problem so stakeholders feel the upside early.",
    price: "£5k–£15k",
    priceNote: "typically a single statement of work",
    duration: "Roughly four to six weeks · shorter when the slice stays small",
    cta: "Talk to us",
    highlight: false,
    items: [
      "One or two production workflows or a modest internal surface (forms, queues, approvals)",
      "Light-touch AI where it earns its place — triage, summaries, tagging, guided next steps",
      "Walkthrough sessions so operators aren’t guessing after handover",
      "Thirty days of tighten-and-fix after go-live",
    ],
    footnote: "Useful when you want evidence before betting a bigger programme.",
  },
  {
    name: "Amplify",
    tagline: "Several lanes at once",
    summary: "Join up more of the messy middle — fewer swivel-chair hops between tools and spreadsheets.",
    price: "£15k–£50k",
    priceNote: "milestone SoW or rolling monthly capacity after discovery",
    duration: "Around six to twelve weeks for the core wave · each lane can land on its own cadence",
    cta: "Talk to us",
    highlight: true,
    items: [
      "Multiple connected workflows and/or meatier low-code apps with clearer guardrails",
      "Analytics-oriented or planning-oriented AI where data quality supports it",
      "Patterns and coaching so confident builders inside your org can extend safely",
      "Sixty-day refinement window — or switch to retainer-style continuity if that suits",
    ],
    footnote: "Best when you already believe in the approach and want compounding operational leverage.",
  },
  {
    name: "Programme",
    tagline: "Organisation-wide arc",
    summary: "For heavier integration, policy constraints, and roadmaps that stretch beyond a single quarter.",
    price: "£50k–£250k+",
    priceNote: "usually phased billing · milestones plus optional ongoing capacity",
    duration: "From a few months upward — capability arrives in waves rather than one cliff-edge release",
    cta: "Talk to us",
    highlight: false,
    items: [
      "Architecture that respects compliance, audit trails, and geography where relevant",
      "Deeper automation and AI anchored to controls, reporting, and operational truth",
      "Named technical leadership across phases plus a sequenced delivery map",
      "Structured upskill tracks for sizeable operational populations",
    ],
    footnote: "Built for teams treating internal tooling as infrastructure — not a one-off project.",
  },
];

export const opsAiPaymentModels: { title: string; body: string }[] = [
  {
    title: "Fixed-scope phases",
    body: "A bounded backlog with agreed acceptance checks — invoicing tracks delivered milestones rather than open-ended hours.",
  },
  {
    title: "Retainer or day-rate blocks",
    body: "After something is live, reserve predictable capacity for enhancements, new flows, and incident-heavy periods.",
  },
  {
    title: "Hybrid",
    body: "Larger drops billed at milestones, with a lighter standing monthly amount for small changes and coaching.",
  },
];
