import type { Quality, ResolvedSource, StreamVariant } from "../../types.js";

function scoreVariant(v: StreamVariant): number {
  const heightScore = (v.height ?? 0) * 1000;
  const bandwidthScore = (v.bandwidth ?? 0) / 1000;
  return heightScore + bandwidthScore;
}

export function pickBestVariant(variants: StreamVariant[]): StreamVariant | null {
  if (variants.length === 0) return null;
  return variants.reduce((best, current) =>
    scoreVariant(current) > scoreVariant(best) ? current : best,
  );
}

function qualityFromVariant(v: StreamVariant): Quality {
  return {
    label: v.label,
    width: v.width,
    height: v.height,
    bandwidth: v.bandwidth,
  };
}

export function pickBestSource(sources: ResolvedSource[]): ResolvedSource | null {
  if (sources.length === 0) return null;

  const scored = sources
    .filter((s) => !s.error && s.streamUrl)
    .map((s) => {
      const height = s.quality.height ?? 0;
      const bandwidth = s.quality.bandwidth ?? 0;
      const typeBonus = s.type === "hls" && height > 0 ? 1 : 0;
      return { source: s, score: height * 1000 + bandwidth / 1000 + typeBonus };
    });

  if (scored.length === 0) return null;

  return scored.reduce((best, cur) => (cur.score > best.score ? cur : best)).source;
}

export function applyBestVariant(source: ResolvedSource): ResolvedSource {
  if (source.type !== "hls" || !source.variants?.length) return source;

  const best = pickBestVariant(source.variants);
  if (!best) return source;

  return {
    ...source,
    streamUrl: best.url,
    quality: qualityFromVariant(best),
  };
}
