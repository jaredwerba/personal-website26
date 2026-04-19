import { getSnapshot, isStorageConfigured, type WhoopSnapshot } from "@/lib/storage";
import HealthView from "./HealthView";

export const revalidate = 86400;

async function loadSnapshot(): Promise<WhoopSnapshot | null> {
  if (!isStorageConfigured()) return null;
  try {
    return await getSnapshot();
  } catch {
    return null;
  }
}

export default async function HealthPage() {
  const snapshot = await loadSnapshot();
  return <HealthView snapshot={snapshot} />;
}
