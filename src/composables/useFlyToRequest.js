import { ref } from 'vue'

export const requestButtonRef = ref(null)

const FALLBACK_TARGET = () => ({
  left: window.innerWidth - 220,
  top: 48,
  width: 200,
  height: 48,
})

export function flyCardToRequestButton(sourceEl) {
  if (!sourceEl) return

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const sourceRect = sourceEl.getBoundingClientRect()
      const targetRect = requestButtonRef.value?.getBoundingClientRect() ?? FALLBACK_TARGET()

      const clone = sourceEl.cloneNode(true)
      clone.removeAttribute('role')
      clone.removeAttribute('tabindex')
      clone.style.pointerEvents = 'none'
      clone.style.margin = '0'
      clone.style.boxShadow = 'none'

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
        opacity: 0.5;
        border-radius: var(--radius-md, 20px);
        overflow: hidden;
        transform-origin: center center;
      `
      ghost.appendChild(clone)

      document.body.appendChild(ghost)

      const targetCenterX = targetRect.left + targetRect.width / 2
      const targetCenterY = targetRect.top + targetRect.height / 2
      const sourceCenterX = sourceRect.left + sourceRect.width / 2
      const sourceCenterY = sourceRect.top + sourceRect.height / 2

      const translateX = targetCenterX - sourceCenterX
      const translateY = targetCenterY - sourceCenterY
      const scale = Math.min(0.12, targetRect.width / sourceRect.width)

      const animation = ghost.animate(
        [
          {
            transform: 'translate(0, 0) scale(1)',
            opacity: 0.5,
          },
          {
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            opacity: 0,
          },
        ],
        {
          duration: 700,
          easing: 'cubic-bezier(0.33, 0.9, 0.45, 1)',
          fill: 'forwards',
        },
      )

      animation.onfinish = () => ghost.remove()
    })
  })
}
