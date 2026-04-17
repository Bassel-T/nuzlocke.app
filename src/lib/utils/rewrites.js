import { building, dev } from '$app/environment'
const rewrite = !building && !dev

// TODO: Remember to update `vercel.json` in root of project when
// modifying these sources

export const SPRITE = 'https://img.nuzlocke.app/sprites'
export const CUSTOM = 'https://img.nuzlocke.app/sprites'
export const IMG = '/assets/img'
export const SHARE = 'https://share.nuzlocke.app'

export const DATA = rewrite ? '/api' : '/api' // Load locally for development

export const QRCODE = rewrite
  ? '/assets/js/qrcode.min.js'
  : 'https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs@gh-pages/qrcode.min.js'

export const INSTASCAN = rewrite
  ? '/assets/js/instascan.min.js'
  : 'https://cdn.jsdelivr.net/gh/schmich/instascan-builds@master/instascan.min.js'

export const UNOWN = 'https://img.nuzlocke.app/sprites/unown.png?v=1'

export const createImgUrl = (p, { ext = 'webp', shiny = false } = {}) => {
  if (!p) return UNOWN
  if (p.imgUrl) return `${CUSTOM}${p.imgUrl}.${ext}`

  const normalId = ('' + (p.imgId || p.sprite || ''))
    .replace('.png', '')
    .replace('.webp', '')

  if (!normalId) return UNOWN

  if (shiny) return `${SPRITE}/shiny/${normalId}.${ext}`
  return `${SPRITE}/base/${normalId}.${ext}`
}

export const bossToImage = (bossData) => {
  let img = null;
  if(typeof bossData.img !== 'undefined') {
    img = typeof bossData.img === 'string' ? { src: bossData.img } : bossData.img

    if(!img) return img;

    if(img.src.startsWith('/leaders/')) {
      img.src = `/assets/img${img.src}`;
    }
    if(img.src.startsWith('/sprite/')) {
      img.src = `/assets/img/pokemon/base-${img.src.slice(8)}`;
    }
  }
  return img;
}
