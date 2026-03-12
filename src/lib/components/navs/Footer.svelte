<script>
  import { Icon } from '$c/core'
  import { Coffee, GitHub, Discord, Heart } from '$icons'
</script>

<footer class={$$restProps.class || ''}>
  <p>
	  <!--a href="https://www.buymeacoffee.com/nuzlocketracker"
       rel=noreferrer target=_blank>
      <button aria-label='Support me' title='Supprt me'>
        <Icon inline={true} class='fill-current' icon={Coffee} />
      </button>
    </a-->

    <a href="https://github.com/Bassel-T/nuzlocke.app/issues/new?assignees=&labels=&projects=&template=bug_report.md&title="
       rel=noreferrer target=_blank>
      <button aria-label='Report bugs' title='Report bugs'>
        <Icon inline={true} class='fill-current' icon={GitHub} />
      </button>
    </a>

    <a href="https://discord.gg/bmsPuMhmxb"
       rel=noreferrer target=_blank>
      <button aria-label='Discuss & follow new features' title='Discuss & follow new features'>
        <Icon inline={true} class=' fill-current' icon={Discord} />
      </button>
    </a>

  </p>


  <span class='inline-flex items-center mb-2'>Made with <Icon inline={true} icon={Heart} class='mx-1 fill-current text-red-500' /> by<strong class=ml-1>Domtronn</strong></span>
	<br/>
  <span class='inline-flex items-center mb-2'>Maintained with <Icon inline={true} icon={Heart} class='mx-1 fill-current text-red-500' /> by<strong class=ml-1>Bassel</strong></span>
  <br />
  <div class="copyright">
    All content & design © Pokémon Nuzlocke Tracker, 2021-{(new Date()).getFullYear()}. <a href='/privacy-policy'>Privacy Policy</a>. <a href='/credit'>Credits</a>.<br/>
    Pokémon images & names © 1995-2024 Nintendo/Creatures Inc./GAME FREAK inc. TM
  </div>
</footer>

<!-- svelte-ignore css-unused-selector -->
<style>
  footer { @apply text-center w-full absolute bottom-4 px-4 text-tiny text-gray-500 dark:text-gray-400 leading-3 z-20 h-max; }
  footer .copyright { @apply max-w-xs mx-auto; }
  footer > p { @apply flex justify-center text-2xl gap-x-2; }
  footer a,
  footer button { @apply transition-colors; }
  footer button:hover, footer a:hover, { @apply text-black }
  :global(.dark) footer button:hover, :global(.dark) footer a:hover { @apply text-white }
  footer button { @apply p-3 }
</style>
