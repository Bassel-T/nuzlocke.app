<script>
  import { browser } from '$app/environment'
  import { capitalise, regionise } from '$utils/string'
  import { PIcon, Button, IconButton, Logo } from '$c/core'
  import { X } from '$icons'

  export let max = 6,
    mons = [],
    submit

  import { getContext } from 'svelte'
  import {
    getBox,
    savedGames,
    parse,
    activeGame,
    getGameStore,
    read,
    readTeam,
    IDS
  } from '$lib/store'
  import { NuzlockeGroups } from '$lib/data/states'

  const { close } = getContext('simple-modal')

  const getSelectionKey = (mon) =>
    mon?.kind === 'import'
      ? `import:${mon.sourceGameId}:${mon.sourceLocation}`
      : `local:${mon.id}:${mon.customId || mon.location}`

  const parseGame = (id) => {
    if (!browser || !id) return {}

    try {
      return JSON.parse(window.localStorage.getItem(IDS.game(id)) || '{}')
    } catch (e) {
      console.error(e)
      return {}
    }
  }

  let availableMons = []
  getBox((b) => {
    availableMons = b.filter(
      (p) =>
        !mons.find((m) => (m.customId || m.location) === (p.customId || p.location))
    )
  })

  let currentData = {},
    games = []

  activeGame.subscribe((id) => {
    savedGames.subscribe(
      parse((g) => {
        games = Object.values(g).filter((i) => i.id !== id)
      })
    )

    if (id)
      getGameStore(id).subscribe(
        read((data) => {
          currentData = data
        })
      )
  })

  let mode = 'local',
    sourceGameId = null

  const resetSelection = () => {
    selected = new Set([])
    ids = []
  }

  const setMode = (next) => () => {
    mode = next
    sourceGameId = null
    resetSelection()
  }

  const setSourceGame = (id) => () => {
    sourceGameId = id
    resetSelection()
  }

  const toImportKey = ({ gameId, sourceLocation }) => `${gameId}:${sourceLocation}`
  const importedKeys = (data) =>
    new Set(
      Object.values(data || {})
        .filter((i) => i?.importedFrom?.gameId && i?.importedFrom?.sourceLocation)
        .map((i) => toImportKey(i.importedFrom))
    )

  $: sourceGames = games
  $: sourceGame = sourceGames.find((game) => game.id === sourceGameId)
  $: sourceData = parseGame(sourceGameId)
  $: sourceCustom = (sourceData.__custom || []).reduce(
    (acc, item) => ({ ...acc, [item.id]: item }),
    {}
  )
  $: hiddenImports = importedKeys(currentData)
  $: sourceMons = !sourceGame
    ? []
    : readTeam(sourceData)
        .map((location) => ({ location, data: sourceData?.[location] }))
        .filter(
          ({ location, data }) =>
            data?.pokemon &&
            NuzlockeGroups.Available.includes(data?.status) &&
            !hiddenImports.has(`${sourceGame.id}:${location}`)
        )
        .map(({ location, data }) => ({
          kind: 'import',
          sourceGameId: sourceGame.id,
          sourceGameName: sourceGame.name,
          sourceLocation: location,
          sourcePokemon: data.pokemon,
          pokemon: data.pokemon,
          nickname: data.nickname,
          nature: data.nature,
          customName: sourceCustom?.[location]?.name,
          location: data.location
        }))

  let selected = new Set([]),
    selectedMons = [],
    ids = []
  $: ids = [...selected]
  $: selectedPool = mode === 'import' ? sourceMons : availableMons
  $: selectedMap = selectedPool.reduce(
    (acc, mon) => ({ ...acc, [getSelectionKey(mon)]: mon }),
    {}
  )
  $: selectedMons = ids.map((id) => selectedMap?.[id]).filter((i) => i)

  const select = (mon) => () => {
    const id = getSelectionKey(mon)
    selected.has(id) ? selected.delete(id) : selected.add(id)
    ids = [...selected]
  }

  const onsubmit = () => {
    submit(selectedMons)
    close()
  }

  $: canImport = sourceGames.length > 0 && max > 0
  $: hasAnyOptions = availableMons.length > 0 || canImport
  $: helperText = selectedMons.length
    ? `Add ${selectedMons
        .map((m) => regionise(capitalise(m.pokemon)))
        .join(', ')
        .replace(/^(.*), /, '$1 and ')} to your team`
    : ''
</script>

<section class="bg-white px-4 py-6 text-xl shadow-lg dark:bg-gray-900 dark:text-gray-50 md:px-6 md:py-8 rounded-xl">
  {#if hasAnyOptions}
    <IconButton
      rounded
      borderless
      color="orange"
      containerClassName="absolute top-2 right-2"
      src={X}
      on:click={close}
      tabIndex="3"
      title="Close modal"
    />

    <h2>Add to team</h2>
    <p class="text-base text-gray-400">
      <b>{selectedMons.length} / {max}</b> Pokémon selected to add to your team.
    </p>

    {#if mode === 'import' && !sourceGame}
      <div class="my-4 rounded-lg bg-gray-100 py-3 dark:bg-gray-800">
        <p class="mb-3 px-4 text-base text-gray-400">
          Select a previous run to import from.
        </p>

        {#if sourceGames.length}
          <ul class="max-h-56 divide-y overflow-y-auto dark:divide-gray-700">
            {#each sourceGames as game}
              <li>
                <button
                  class="inline-flex w-full items-center justify-between px-4 py-3 text-left text-sm text-gray-600 transition hover:text-blue-400 dark:text-gray-200 dark:hover:text-blue-500"
                  on:click={setSourceGame(game.id)}
                  title="Select game {game.name}"
                >
                  <span class="mr-4 line-clamp-1">{game.name}</span>
                  <Logo
                    alt="{game.name} logo"
                    logo="{game?.game}"
                    class="ml-2 w-16 shrink-0"
                    aspect="192x96"
                  />
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="px-4 text-sm text-gray-500">
            No other saved runs are available to import from.
          </p>
        {/if}
      </div>
    {:else}
      {#if mode === 'import' && sourceGame}
        <div class="my-2 flex items-center justify-between gap-3 text-sm text-gray-400">
          <p class="line-clamp-2">
            Importing from <b>{sourceGame.name}</b>
          </p>

          <Button className="shrink-0 px-3" rounded solid on:click={setMode('import')}>
            <small>Change run</small>
          </Button>
        </div>
      {/if}

      <div class="grid grid-cols-4 md:grid-cols-6 bg-gray-200 dark:bg-gray-800 px-2 md:px-6 py-4 mx4 my-2 md:my-6 h-fit overflow-hidden rounded-lg">
        {#if selectedPool.length}
          {#each selectedPool as mon (getSelectionKey(mon))}
            {@const selectionKey = getSelectionKey(mon)}
            <button
              class="transition relative"
              disabled={ids.length >= max && !ids.includes(selectionKey)}
              class:grayscale={ids.length >= max && !ids.includes(selectionKey)}
              class:selected={ids.includes(selectionKey)}
              on:click={select(mon)}
            >
              <PIcon class="pointer-events-none transform scale-150" name={mon.pokemon} />
            </button>
          {/each}
        {:else if mode === 'import' && sourceGame}
          <p class="col-span-full py-4 text-center text-sm text-gray-500">
            No team Pokémon from this run are available to import.
          </p>
        {:else}
          <p class="col-span-full py-4 text-center text-sm text-gray-500">
            You have no Pokémon in your box to add right now.
          </p>
        {/if}
      </div>
    {/if}

    <p class="mb-4 min-h-[1.5rem] text-base text-gray-400">
      {helperText}
    </p>

    <div class="flex flex-row-reverse gap-2 md:gap-4">
      <Button
        className="flex-1"
        wide
        rounded
        disabled={ids.length === 0}
        on:click={onsubmit}
      >
        <small>Add to team</small>
      </Button>

      <Button className="flex-1" solid wide rounded on:click={close}>
        <small>Cancel</small>
      </Button>
    </div>

    {#if mode === 'local'}
      <Button
        className="mt-3 w-full"
        solid
        wide
        rounded
        disabled={!canImport}
        on:click={setMode('import')}
      >
        <small>Import from Previous Run</small>
      </Button>

      {#if !sourceGames.length}
        <p class="mt-2 text-center text-sm text-gray-500">
          No other saved runs are available on this profile yet.
        </p>
      {/if}
    {:else}
      <Button className="mt-3 w-full" wide rounded on:click={setMode('local')}>
        <small>Back to Current Run</small>
      </Button>
    {/if}
  {:else}
    <p class="mb-4 max-w-[30ch] text-center">
      You have no Pokémon in your box to add, and there are no previous runs available to import from.
    </p>
    <Button className="w-full" solid wide rounded on:click={close}>
      <small>Go back</small>
    </Button>
  {/if}
</section>

<style>
  button:enabled:not(.selected):hover :global(.pkm){
    animation: shake 3.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
  }

  button:before {
    content: '';
    position: absolute;
    border-radius: 100%;
    @apply bg-transparent transition w-14 h-6 left-1/2 -translate-x-1/2 -bottom-2;
  }
  
  button.selected::before {
    @apply bg-gray-400;
  }

  button:not(.selected):enabled:hover::before {
    @apply bg-gray-300;
  }

  :global(.dark) button.selected::before {
    @apply bg-gray-600;
  }

  :global(.dark) button:not(.selected):enabled:hover::before {
    @apply bg-gray-700;
  }

  
  button.selected :global(.pkm) {
    animation: bob 3s ease infinite;
  }

  @keyframes bob {
    0% { transform: translateY(-8px); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(-8px); }
  }
  
</style>
