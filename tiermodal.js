export class TierModal {
  selectors = {
    overlay: '.overlay',
    colorOption: '.modal__color-option',
    textarea: '.modal__textarea',
    closeBtn: '.modal__close-btn',
    colorSelect: '.modal__color-select',
    btns: '.modal__btns',
    pool: '.image-pool__items'
  };

  ACTIONS = {
    DELETE: 'Delete Row',
    CLEAR: 'Clear Row Images',
    ADD_ABOVE: 'Add a Row Above',
    ADD_BELOW: 'Add a Row Below'
  };

  constructor() {
    this.editableTier = null;
    this.chosenColorElement = null;
    this.overlayElement = document.querySelector(this.selectors.overlay);
    this.colorsElements = document.querySelectorAll(this.selectors.colorOption);
    this.modalTextareaElement = document.querySelector(this.selectors.textarea);
    this.closeOverlayElement = document.querySelector(this.selectors.closeBtn);
    this.modalColorsElements = document.querySelector(this.selectors.colorSelect);
    this.modalBtnsElements = document.querySelector(this.selectors.btns);
    this.tierImagesPool = document.querySelector(this.selectors.pool);
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('click', (evt) => {
      const isOpened = this.openTierModal(evt);
      if (isOpened) {
        this.setDefaultModalValues();
      }
    });
    
    this.overlayElement.addEventListener('click', (evt) => {
      if (evt.target.classList.contains('overlay')) {
        this.closeTierModal()
      }
    })

    this.closeOverlayElement.addEventListener('click', () => {
      this.closeTierModal()
    });

    this.modalColorsElements.addEventListener('click', (evt) => {  
      this.handleColorSelection(evt)
    });

    this.modalTextareaElement.addEventListener('input', (evt) => {
      this.editableTier.firstElementChild.textContent = evt.target.value
    })

    this.modalBtnsElements.addEventListener('click', (evt) => {
      this.handleModalButtons(evt)
    })
  }

  handleModalButtons(evt) {
    const btn = evt.target.closest('.modal__btn')
    if (!btn) return

    const btnText = btn.textContent
    const editableTier = this.editableTier

    if (btnText === this.ACTIONS.DELETE) {
      this.moveImagesToPool(editableTier)
      editableTier.remove()
      this.closeTierModal()
      this.editableTier = null
      return
    }

    if (btnText === this.ACTIONS.CLEAR) {
      this.moveImagesToPool(editableTier)
      return
    }

    const newTier = this.createTierFromCurrent()

    if (btnText === this.ACTIONS.ADD_ABOVE) {
      editableTier.before(newTier)
    } else {
      editableTier.after(newTier)
    }
  }

  moveImagesToPool(tier) {
    const itemsContainer = tier.children[1]
    const images = itemsContainer.children

    this.tierImagesPool.append(...images)
    itemsContainer.innerHTML = ''
  }
  
  createTierFromCurrent() {
    let newTier = document.createElement('div')
    newTier.classList.add('tier')
    newTier.append(
      this.editableTier.children[0].cloneNode(), 
      this.editableTier.children[1].cloneNode(), 
      this.editableTier.children[2].cloneNode(true)
    )
    newTier.children[0].textContent = ""
    newTier.children[1].innerHTML = ''
    return newTier
  }

  handleColorSelection(evt) {
    const newChosenColorElement = evt.target.closest('.modal__color-option');
    if (!newChosenColorElement || newChosenColorElement === this.chosenColorElement) return; 
    newChosenColorElement.classList.add('modal__color-option--chosen');
    this.chosenColorElement.classList.remove('modal__color-option--chosen');
    this.editableTier.firstElementChild.style.backgroundColor = newChosenColorElement.style.backgroundColor
    this.chosenColorElement = newChosenColorElement
  }

  openTierModal(evt) {
    if (!evt.target.matches('.tier__settings-button')) return false;

    this.overlayElement.classList.add('overlay--active');
    this.editableTier = evt.target.closest('.tier');
    return true;
  }

  closeTierModal() {
    this.overlayElement.classList.remove('overlay--active')
  }

  setDefaultModalValues() {
    const defaultLabelColor = getComputedStyle(this.editableTier.firstElementChild).backgroundColor;
    this.colorsElements.forEach((item) => {
      if (item.style.backgroundColor === defaultLabelColor) {
        item.classList.add('modal__color-option--chosen');
        this.chosenColorElement = item;
      }
    });

    const defaultLabelText = this.editableTier.children[0].textContent.trim();
    this.modalTextareaElement.value = defaultLabelText;
  }
}