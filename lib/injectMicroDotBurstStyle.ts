// Injects the micro-dot burst effect CSS globally if not already present
export function injectMicroDotBurstStyle() {
  if (typeof window === 'undefined') return;
  const styleId = 'micro-dot-burst-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .micro-dot-burst::before {
        content: '';
        position: absolute;
        right: 0;
        bottom: 0;
        width: 140px;
        height: 140px;
        pointer-events: none;
        z-index: 0;
        opacity: 0.35;
        background: repeating-radial-gradient(
          circle at 90% 90%,
          var(--accent) 0px, var(--accent) 0.7px, transparent 1.2px, transparent 7px
        ),
        repeating-radial-gradient(
          circle at 80% 80%,
          var(--primary) 0px, var(--primary) 0.5px, transparent 1px, transparent 6px
        );
        mask-image: linear-gradient(135deg, transparent 0%, black 60%, transparent 100%);
      }
    `;
    document.head.appendChild(style);
  }
}
