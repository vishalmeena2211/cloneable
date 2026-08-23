import {
  Code,
  Gauge,
  Layers,
  Palette,
  Shield,
  Sparkles,
  Wand,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import type { IconName } from "@/content/pages/home";

/**
 * Content stores an icon *name*, never a component, so the editor can offer a
 * dropdown and the JSON stays serialisable. A clone replaces this map with the
 * SVGs extracted from the source site.
 */
export const ICONS: Record<IconName, LucideIcon> = {
  sparkles: Sparkles,
  gauge: Gauge,
  layers: Layers,
  palette: Palette,
  shield: Shield,
  workflow: Workflow,
  wand: Wand,
  code: Code,
};
