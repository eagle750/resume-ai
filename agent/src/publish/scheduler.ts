import { AGENT_CONFIG, type ContentType } from "../config";
import { logger } from "../utils/logger";

function getHHMMInTimezone(timeZone: string, date = new Date()): string {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return dtf.format(date);
}

export function resolveSlotFromNow(now = new Date()): {
  slotIndex: number;
  type: ContentType;
} {
  const envSlot = process.env.POSTING_SLOT;
  if (envSlot) {
    const slotIndex = Number(envSlot);
    const slot = AGENT_CONFIG.postingSlots.find((s) => s.index === slotIndex);
    if (slot) return { slotIndex, type: slot.type };
    throw new Error(`Invalid POSTING_SLOT=${envSlot}`);
  }

  const nowHHMM = getHHMMInTimezone(AGENT_CONFIG.timezone, now);
  const slot = AGENT_CONFIG.postingSlots.find((s) => s.time === nowHHMM);
  if (!slot) {
    const times = AGENT_CONFIG.postingSlots.map((s) => s.time);
    const idx = times.findIndex((t) => t >= nowHHMM);
    const fallback =
      idx >= 0 ? AGENT_CONFIG.postingSlots[idx] : AGENT_CONFIG.postingSlots[0];
    logger.warn("Slot mismatch; using fallback slot", {
      nowHHMM,
      fallback: fallback.time,
    });
    return { slotIndex: fallback.index, type: fallback.type };
  }

  return { slotIndex: slot.index, type: slot.type };
}

