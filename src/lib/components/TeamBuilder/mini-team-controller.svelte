<script>
  import { IconButton, Icon } from '$c/core'
  import { X, Ball, Plus } from '$icons'

  import { MiniTeam } from './'
  import { locid as pokeLocId } from '$utils/pokemon'
  import { shortuuid } from '$utils/uuid'
  import { fade } from 'svelte/transition'
  import {
    getGameStore,
    readdata,
    readBox,
    readTeam,
    read,
    patch
  } from '$lib/store'
  let teamData = [],
    boxData = [],
    boxLength = 0,
    setTeam = (_) => _,
    gameStore,
    seenTeam,
    gameData = {}

  async function setup() {
    const [, , id] = readdata()

    gameStore = getGameStore(id)
    gameStore.subscribe(
      read((data) => {
        gameData = data
        seenTeam = Object.hasOwnProperty.call(data, '__team')
        teamData = readTeam(data)
        boxData = readBox(data).reduce(
          (acc, it) => ({ ...acc, [pokeLocId(it)]: it }),
          {}
        )
        boxLength = readBox(data).length
      })
    )

    setTeam = (data) => gameStore.update(patch({ __team: data.slice(0, 6) }))
  }

  const locid = (evt) => pokeLocId(evt.detail.data)
  const toarray = (data) => (teamData ? [].concat(teamData) : [])

  const createImportPayload = (imports = []) => {
    const data = gameData || {}
    const custom = data.__custom || []
    const nextId = Object.values(data).reduce((max, item) => {
      if (typeof item?.id !== 'number') return max
      return Math.max(max, item.id)
    }, 0)

    let counter = 0
    const additions = {}
    const newCustom = []
    const teamIds = []

    const createCustomId = () => {
      let id = shortuuid()
      while (data[id] || additions[id]) id = shortuuid()
      return id
    }

    imports.forEach((mon) => {
      const customId = createCustomId()
      const importName = `Import`
      const location = mon.sourceGameName
      const id = nextId + counter + 1
      counter++

      additions[customId] = {
        id,
        pokemon: mon.pokemon,
        status: 2,
        location,
        ...(mon.nickname ? { nickname: mon.nickname } : {}),
        ...(mon.nature ? { nature: mon.nature } : {}),
        importedFrom: {
          gameId: mon.sourceGameId,
          gameName: mon.sourceGameName,
          sourceLocation: mon.sourceLocation,
          sourcePokemon: mon.sourcePokemon
        }
      }

      newCustom.push({
        type: 'custom',
        name: importName,
        id: customId,
        index: id
      })
      teamIds.push(customId)
    })

    return {
      payload: {
        ...additions,
        __custom: custom.concat(newCustom)
      },
      teamIds
    }
  }

  const addEntriesToTeam = (entries = []) => {
    if (!entries.length) return

    const localMons = entries.filter((entry) => entry?.kind !== 'import')
    const importedMons = entries.filter((entry) => entry?.kind === 'import')

    let nextTeam = toarray(teamData)
    localMons.forEach((mon) => {
      const id = pokeLocId(mon)
      nextTeam = nextTeam.filter((i) => i !== id).concat(id)
    })

    if (!importedMons.length) return setTeam(nextTeam)

    const { payload, teamIds } = createImportPayload(importedMons)
    gameStore.update(
      patch({
        ...payload,
        __team: nextTeam.concat(teamIds).slice(0, 6)
      })
    )
  }

  const onteamadd = (evt) => {
    addEntriesToTeam([evt.detail.data])
  }

  const onteamremove = (evt) => {
    setTeam(toarray(teamData).filter((i) => i !== locid(evt)))
  }

  const onteamreplace = (evt) => {
    if (toarray(teamData).includes(locid(evt)))
      return onteamswap({
        detail: {
          ...evt.detail,
          srcId: toarray(teamData).findIndex((id) => id === locid(evt))
        }
      })

    setTeam(
      toarray(teamData).map((id, i) =>
        i === +evt.detail.targetId ? locid(evt) : id
      )
    )
  }

  const onteamswap = (evt) => {
    const targetId = Math.min(evt.detail.targetId, toarray(teamData).length - 1)
    const srcId = evt.detail.srcId

    setTeam(
      toarray(teamData).map((it, i, arr) => {
        if (i === targetId) return arr[srcId]
        if (i === srcId) return arr[targetId]
        return it
      })
    )
  }

  const onteamclear = () => setTeam([])
  const onteamsubmit = (evt) => addEntriesToTeam(evt.detail || [])

  $: mons = (teamData || []).map((t) => boxData[t]).filter((i) => i)
</script>

{#await setup() then}
  <div transition:fade|local={{ delay: 500 }} class="safe-bottom">
    <MiniTeam
      class="transform max-md:scale-75 md:pl-8 {$$restProps.class || ''}"
      iconKey="pokemon"
      on:add={onteamadd}
      on:submit={onteamsubmit}
      on:swap={onteamswap}
      on:remove={onteamremove}
      on:replace={onteamreplace}
      {mons}
    />

    {#if !mons.length && boxLength}
      <small
        in:fade={{ duration: 500 }}
        out:fade={{ duration: 200 }}
        class:hidden={seenTeam}
        class="absolute left-1/2 mb-1 w-full -translate-x-1/2 translate-y-full italic text-gray-500 md:bottom-2 md:block"
      >
        Drag Pokémon from your box or click add to team
        <span class="relative">
          <Icon
            class="absolute top-0.5 -right-4 scale-110 transform"
            inline
            icon={Ball}
          />
          <Icon
            class="absolute -right-6 -top-0.5 -translate-x-0.5 scale-75 transform rounded-full bg-white dark:bg-gray-800"
            inline
            icon={Plus}
          />
        </span>
      </small>
    {/if}

    <IconButton
      on:click={onteamclear}
      title="Clear your team"
      disabled={!mons?.length}
      borderless
      containerClassName=" rounded-full !border-gray-900 z-50 -translate-x-3/4 md:translate-x-1/2 md:mt-1"
      src={X}
    />
  </div>
{/await}

<style>
  div {
    @apply relative mx-auto flex w-auto items-center text-center;
  }

  @media (max-width: theme('screens.md')) {
    div {
      @apply fixed bottom-0 w-full border-t-2 border-gray-200 bg-white/50 pl-6 pt-3 pb-5 backdrop-blur-sm;
    }

    :global(.dark) div {
      @apply border-gray-900 bg-gray-800/80;
    }
  }
</style>
