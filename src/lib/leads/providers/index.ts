/**
 * Provider registry.
 *
 * The pipeline asks for a provider by id and never constructs one directly, so
 * adding a source is a one-line change here plus the provider module itself.
 */
import type { BusinessDiscoveryProvider } from "./types";
import { overpassProvider } from "./overpass";

const PROVIDERS: Record<string, BusinessDiscoveryProvider> = {
  [overpassProvider.id]: overpassProvider,
};

export const DEFAULT_PROVIDER_ID = overpassProvider.id;

export function getProvider(id: string): BusinessDiscoveryProvider {
  const provider = PROVIDERS[id];
  if (!provider) throw new Error(`Unknown discovery provider "${id}"`);
  return provider;
}

export function listProviders(): BusinessDiscoveryProvider[] {
  return Object.values(PROVIDERS);
}

export * from "./types";
