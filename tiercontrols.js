export class TierList {
  constructor() {
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('click', (evt) => {
      const moveButton = evt.target.closest('.tier__move-up, .tier__move-down');
      if (!moveButton) return;

      const currentTier = evt.target.closest('.tier');
      if (!currentTier) return;

      if (moveButton.classList.contains('tier__move-up')) {
        this.moveTierUp(currentTier);
      } else if (moveButton.classList.contains('tier__move-down')) {
        this.moveTierDown(currentTier);
      }
    });
  }

  moveTierUp(tier) {
    const previous = tier.previousElementSibling;
    if (previous) {
      previous.before(tier);
    }
  }

  moveTierDown(tier) {
    const next = tier.nextElementSibling;
    if (next) {
      next.after(tier);
    }
  }
}