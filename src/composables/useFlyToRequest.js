import { ref } from 'vue'

export const requestButtonRef = ref(null)

const FALLBACK_TARGET = () => ({
  left: window.innerWidth - 220,
  top: 48,
  width: 200,
  height: 48,
})

function prepareFlyClone(el) {
  el.removeAttribute('role')
  el.removeAttribute('tabindex')
  el.style.pointerEvents = 'none'
  el.style.margin = '0'
  el.style.boxShadow = 'none'
  return el
}

export function flyCardToRequestButton(sourceEl, staticClone, sourceRect = sourceEl.getBoundingClientRect()) {
  if (!sourceEl) return

  const borderRadius = getComputedStyle(sourceEl).borderRadius || 'var(--radius-md, 20px)'
  const clone = staticClone
    ? prepareFlyClone(staticClone)
    : null

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targetRect = requestButtonRef.value?.getBoundingClientRect() ?? FALLBACK_TARGET()
      const targetWidth = targetRect.width > 8
        ? targetRect.width
        : Math.max(200, targetRect.height * 4)
      const targetLeft = targetRect.width > 8
        ? targetRect.left
        : targetRect.right - targetWidth

      const flyClone = clone ?? prepareFlyClone(sourceEl.cloneNode(true))

      const ghost = document.createElement('div')
      ghost.className = 'vehicle-card-fly-ghost'
      ghost.style.cssText = `
        position: fixed;
        left: ${sourceRect.left}px;
        top: ${sourceRect.top}px;
        width: ${sourceRect.width}px;
        height: ${sourceRect.height}px;
        z-index: 9999;
        pointer-events: none;
        opacity: 0.88;
        border-radius: ${borderRadius};
        overflow: hidden;
        transform-origin: center center;
      `
      ghost.appendChild(flyClone)

      document.body.appendChild(ghost)

      const targetCenterX = targetLeft + targetWidth / 2
      const targetCenterY = targetRect.top + targetRect.height / 2
      const sourceCenterX = sourceRect.left + sourceRect.width / 2
      const sourceCenterY = sourceRect.top + sourceRect.height / 2

      const translateX = targetCenterX - sourceCenterX
      const translateY = targetCenterY - sourceCenterY
      const scale = Math.min(0.12, targetWidth / sourceRect.width)

      const animation = ghost.animate(
        [
          {
            transform: 'translate(0, 0) scale(1)',
            opacity: 0.88,
          },
          {
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            opacity: 0,
          },
        ],
        {
          duration: 950,
          easing: 'cubic-bezier(0.33, 0.9, 0.45, 1)',
          fill: 'forwards',
        },
      )

      animation.onfinish = () => ghost.remove()
    })
  })
}
