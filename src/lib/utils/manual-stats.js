import { NaturesMap } from '$lib/data/natures'

const clampLevel = (level, fallback = null) => {
  const parsed = Number(level)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(1, Math.min(100, Math.floor(parsed)))
}

const calcNatureMod = (nature, stat) => {
  const [pos, neg] = NaturesMap[nature]?.value || []
  if (pos === stat) return 1.1
  if (neg === stat) return 0.9
  return 1
}

export const calcStatsAtLevel = (
  baseStats = {},
  level,
  nature,
  iv = 31,
  ev = 0
) => {
  const targetLevel = clampLevel(level)
  if (!targetLevel) return null

  return Object.fromEntries(
    Object.entries(baseStats).map(([stat, value]) => {
      const core = Math.floor(
        0.01 * (2 * value + iv + Math.floor(0.25 * ev)) * targetLevel
      )

      if (stat === 'hp') return [stat, core + targetLevel + 10]
      return [stat, Math.floor((core + 5) * calcNatureMod(nature, stat))]
    })
  )
}

export const getTrackedLevel = (pokemon, fallbackLevel = null) =>
  clampLevel(pokemon?.original?.level ?? pokemon?.level, fallbackLevel)

export const applyTrackedStats = (pokemon, fallbackLevel = null) => {
  const level = getTrackedLevel(pokemon, fallbackLevel)
  if (!level) return pokemon

  const stats = calcStatsAtLevel(
    pokemon.baseStats,
    level,
    pokemon.original?.nature
  )
  if (!stats) return pokemon

  return {
    ...pokemon,
    level,
    nature: pokemon.original?.nature ?? pokemon.nature,
    original: {
      ...pokemon.original,
      level,
      stats
    }
  }
}
