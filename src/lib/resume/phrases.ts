/**
 * Curated, editable phrase library used by the "Ideas" pickers in the editor.
 * Placeholders in {curly braces} are hints for the user to fill in.
 */

export const ACTION_VERBS = [
  "Led", "Built", "Launched", "Designed", "Delivered", "Owned", "Drove",
  "Scaled", "Improved", "Reduced", "Increased", "Streamlined", "Automated",
  "Spearheaded", "Established", "Optimized", "Migrated", "Architected",
  "Mentored", "Negotiated", "Coordinated", "Analyzed", "Implemented",
  "Championed", "Accelerated", "Simplified", "Resolved", "Shipped",
];

export type PhraseCategory = {
  id: string;
  label: string;
  bullets: string[];
};

export const BULLET_LIBRARY: PhraseCategory[] = [
  {
    id: "general",
    label: "General",
    bullets: [
      "Drove {initiative} that increased {metric} by {x}% within {timeframe}.",
      "Reduced {cost/time} by {x}% by {action}.",
      "Led a cross-functional team of {n} to deliver {outcome} ahead of schedule.",
      "Owned {area} end-to-end, from {start} to {result}.",
      "Improved {process} efficiency by {x}%, saving {amount} per {period}.",
      "Recognized as {award/rank} for {achievement} among {group}.",
    ],
  },
  {
    id: "software",
    label: "Software Engineering",
    bullets: [
      "Architected and shipped {system}, serving {n} requests/day at {latency} p99.",
      "Reduced build/deploy time by {x}% by {action}, unblocking {n} engineers.",
      "Cut infrastructure costs by {x}% ({amount}/mo) by {optimization}.",
      "Led migration from {tech A} to {tech B} with zero downtime across {n} services.",
      "Improved test coverage from {x}% to {y}%, reducing production incidents by {z}%.",
      "Built {feature} used by {n} users, increasing {engagement metric} by {x}%.",
      "Mentored {n} engineers and established the team's code-review and on-call standards.",
    ],
  },
  {
    id: "data",
    label: "Data & Analytics",
    bullets: [
      "Built {model/pipeline} that improved {metric} by {x}%, driving {business outcome}.",
      "Reduced data-processing time from {a} to {b} by {optimization}.",
      "Developed dashboards adopted by {n} stakeholders to track {KPIs}.",
      "Designed experiments (A/B) that lifted {metric} by {x}% with {confidence}% significance.",
      "Automated {report/ETL}, saving {n} analyst-hours per {period}.",
      "Productionized ML model with {accuracy/AUC} of {x}, deployed to {n} users.",
    ],
  },
  {
    id: "product",
    label: "Product Management",
    bullets: [
      "Defined and shipped {product/feature}, growing {metric} by {x}% in {timeframe}.",
      "Prioritized a roadmap of {n} initiatives aligned to {company goal}.",
      "Ran discovery with {n} customers, translating insights into {n} shipped features.",
      "Increased activation/retention by {x}% through {experiment/change}.",
      "Aligned engineering, design, and GTM to launch {product} to {n} users.",
      "Reduced churn by {x}% by prioritizing {initiative} based on {data}.",
    ],
  },
  {
    id: "design",
    label: "Design & UX",
    bullets: [
      "Redesigned {flow}, improving conversion by {x}% and task success by {y}%.",
      "Built and maintained a design system adopted across {n} products.",
      "Ran {n} usability studies that informed {feature} and cut support tickets by {x}%.",
      "Increased {engagement metric} by {x}% through {design change}.",
      "Partnered with engineering to ship pixel-accurate UI across {platforms}.",
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    bullets: [
      "Grew {channel} by {x}% ({from}→{to}) through {strategy}.",
      "Launched campaigns generating {n} leads and {amount} in pipeline.",
      "Improved conversion rate by {x}% via {experiment/optimization}.",
      "Reduced CAC by {x}% while scaling spend to {amount}/mo.",
      "Built content strategy that grew organic traffic by {x}% in {timeframe}.",
    ],
  },
  {
    id: "sales",
    label: "Sales",
    bullets: [
      "Exceeded quota by {x}% ({amount}) across {n} consecutive quarters.",
      "Closed {n} new accounts worth {amount} in annual recurring revenue.",
      "Grew territory revenue by {x}% year-over-year through {strategy}.",
      "Shortened sales cycle by {x}% by {action}.",
      "Built and managed a pipeline of {amount} across {n} opportunities.",
    ],
  },
  {
    id: "cs",
    label: "Customer Success / Support",
    bullets: [
      "Maintained {x}% CSAT / {y} NPS across {n} accounts.",
      "Reduced churn by {x}% and drove {amount} in expansion revenue.",
      "Cut average resolution time by {x}% by {process improvement}.",
      "Onboarded {n} customers, improving time-to-value by {x}%.",
      "Built a knowledge base that deflected {x}% of inbound tickets.",
    ],
  },
  {
    id: "operations",
    label: "Operations",
    bullets: [
      "Streamlined {process}, reducing cycle time by {x}% and cost by {amount}.",
      "Scaled operations to support {x}% growth without additional headcount.",
      "Implemented {system/tool} adopted by {n} team members.",
      "Negotiated vendor contracts saving {amount} annually.",
      "Improved on-time delivery from {x}% to {y}%.",
    ],
  },
  {
    id: "finance",
    label: "Finance & Accounting",
    bullets: [
      "Managed a {amount} budget, coming in {x}% under plan.",
      "Built financial models that informed {decision}, unlocking {amount}.",
      "Reduced monthly close from {a} days to {b} days by {action}.",
      "Identified {amount} in cost savings through {analysis}.",
      "Ensured compliance with {standard}, passing audits with zero findings.",
    ],
  },
  {
    id: "management",
    label: "Management & Leadership",
    bullets: [
      "Grew and led a team of {n}, improving {metric} by {x}%.",
      "Reduced attrition by {x}% through {initiative}.",
      "Set strategy and OKRs that delivered {outcome} in {timeframe}.",
      "Established hiring process that scaled the team from {a} to {b}.",
      "Coached {n} reports, with {x} promoted within {timeframe}.",
    ],
  },
];

export type SummaryTemplate = { id: string; label: string; text: string };

export const SUMMARY_TEMPLATES: SummaryTemplate[] = [
  {
    id: "engineer",
    label: "Software Engineer",
    text: "Software engineer with {n}+ years building scalable web applications. Specializes in {tech stack}, with a track record of shipping products used by {scale}. Passionate about clean architecture, developer experience, and measurable impact.",
  },
  {
    id: "senior-ic",
    label: "Senior IC",
    text: "Senior {role} who turns ambiguous problems into reliable systems. Combines strong fundamentals with product sense, and enjoys raising the bar for quality while mentoring others.",
  },
  {
    id: "manager",
    label: "Manager / Lead",
    text: "{Role} leader with {n}+ years growing high-performing teams. Blends strategy with execution to deliver {outcomes}, and cares deeply about people development and clear communication.",
  },
  {
    id: "product",
    label: "Product Manager",
    text: "Product manager with {n}+ years shipping customer-loved products. Data-informed and outcome-driven, with experience taking products from discovery to {scale} users.",
  },
  {
    id: "designer",
    label: "Designer",
    text: "{Role} designer focused on simple, accessible experiences. {n}+ years partnering with product and engineering to ship polished interfaces that move key metrics.",
  },
  {
    id: "grad",
    label: "New Graduate",
    text: "Recent {degree} graduate in {field} with hands-on experience through {internships/projects}. Eager to apply {skills} to real-world problems and grow quickly on a strong team.",
  },
  {
    id: "career-change",
    label: "Career Changer",
    text: "{Prior role} transitioning into {target role}, bringing {transferable strengths}. Recently completed {training/projects} and excited to contribute {value} from day one.",
  },
  {
    id: "sales",
    label: "Sales / GTM",
    text: "Results-driven {role} with a record of exceeding quota by {x}%. Skilled at building relationships, running disciplined pipeline, and closing complex deals in {industry}.",
  },
];
