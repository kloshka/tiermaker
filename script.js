class DragAndDrop {
  initialState = {
    offsetX: null,
    offsetY: null,
    isDragging: false,
    currentDraggingElement: null,
    clone: null
  }

  selectors = {
    item: '.tier__item',
    container: '.tier__items',
    label: '.tier__label'
  }

  constructor() {
    this.state = { ...this.initialState }
    this.bindEvents()
  }

onPointerDown(evt) {
  const { target, clientX, clientY } = evt

  if (target.closest('.tier__items')) {
    evt.preventDefault()
  }

  if (!target.classList.contains('tier__item')) return

  const { left, top } = target.getBoundingClientRect()

  const placeholder = target.cloneNode(true)
  placeholder.style.opacity = '0.5'
  target.before(placeholder)

  target.classList.add('tier__item_dragging')

  const { width, height } = getComputedStyle(target)
  Object.assign(target.style, {
    width,
    height,
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    zIndex: '2'
  })

  document.documentElement.append(target)

  this.state = {
    offsetX: clientX - left,
    offsetY: clientY - top,
    isDragging: true,
    currentDraggingElement: target,
    placeholder
  }
}

onPointerMove(evt) {
  if (!this.state.isDragging) return;

  this.updateDraggedPosition(evt);
  this.processDropPosition(evt);
}

updateDraggedPosition(evt) {
  const { pageX, pageY } = evt;
  const { currentDraggingElement, offsetX, offsetY } = this.state;
  const newX = pageX - offsetX;
  const newY = pageY - offsetY;
  currentDraggingElement.style.left = `${newX}px`;
  currentDraggingElement.style.top = `${newY}px`;
}

processDropPosition(evt) {
  const { clientX, clientY } = evt;
  const { currentDraggingElement, placeholder } = this.state;

  const target = evt.target;
  const container = target.closest('.tier__items');
  if (!container) return;

  const { width: cW, height: cH, top: cTop } = container.getBoundingClientRect();
  const { width: eW, height: eH } = currentDraggingElement.getBoundingClientRect();

  const elementUnderCursor = document.elementFromPoint(clientX, clientY);

  const row = Math.ceil((clientY - cTop) / eH);
  const rows = Math.round(cH / eH);
  const elemInRow = Math.floor(cW / eW);

  if (elementUnderCursor?.classList.contains('tier__item')) {
    this.insertRelativeToItem(elementUnderCursor, clientX, placeholder);
  } else if (row === rows) {
    container.appendChild(placeholder);
  } else {
    const index = row * elemInRow - 1;
    container.children[index].after(placeholder);
  }
}

insertRelativeToItem(targetItem, clientX, placeholder) {
  const { left, right } = targetItem.getBoundingClientRect();
  const centerX = (left + right) / 2;

  if (clientX <= centerX) {
    targetItem.before(placeholder);
  } else {
    targetItem.after(placeholder);
  }
}

onPointerUp() {
  if (!this.state.isDragging) return

  const { currentDraggingElement, placeholder } = this.state

  currentDraggingElement.classList.remove('tier__item_dragging')
  Object.assign(currentDraggingElement.style, {
    position: '',
    left: '',
    top: '',
    width: '',
    height: '',
    zIndex: ''
  });

  placeholder.replaceWith(currentDraggingElement)

  this.state = { ...this.initialState }
}


bindEvents() {
    document.addEventListener('pointerdown', (event) => this.onPointerDown(event))
    document.addEventListener('pointermove', (event) => this.onPointerMove(event))
    document.addEventListener('pointerup', () => this.onPointerUp())
  }
}

new DragAndDrop()


const fileInputElement = document.querySelector('.file__input')
const poolElement = document.querySelector('.tier__items--pool')
fileInputElement.addEventListener('change', (evt) => {
  const files = evt.target.files

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;

    const reader = new FileReader();

    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'tier__item';
      div.style.background = `url('${e.target.result}') center / cover no-repeat`;
      poolElement.appendChild(div);
    };
    reader.readAsDataURL(file);
  }
  fileInputElement.value = '';
})








class TierModal {
  selectors = {
    overlay: '.overlay',
    colorOption: '.modal__color-option',
    textarea: '.modal__textarea',
    closeBtn: '.modal__close-btn',
    colorSelect: '.modal__color-select',
    btns: '.modal__btns',
    pool: '.tier__items--pool'
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

  handleModalButtons(evt){
    const btnText = evt.target.closest('.modal__btn').textContent
    const editableTier = this.editableTier
    if (btnText == this.ACTIONS.DELETE){
      editableTier.remove()
      this.closeTierModal()
      this.editableTier = null
      return
    } else if (btnText == this.ACTIONS.CLEAR){
      const clearedImages = editableTier.children[1].children
      this.tierImagesPool.append(...clearedImages)
      editableTier.children[1].innerHTML = '' 
      return 
    } 
    let newTier = this.createTierFromCurrent()
    if (btnText == this.ACTIONS.ADD_ABOVE) {
      editableTier.before(newTier)
    } else {
      editableTier.after(newTier)
    }
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
    if (!newChosenColorElement) return; 
    newChosenColorElement.classList.add('chosen');
    this.chosenColorElement.classList.remove('chosen');
    this.editableTier.firstElementChild.style.backgroundColor = newChosenColorElement.style.backgroundColor
    this.chosenColorElement = newChosenColorElement
  }

  openTierModal(evt) {
    if (!evt.target.matches('.tier__settings-button')) return false;

    this.overlayElement.classList.add('active');
    this.editableTier = evt.target.closest('.tier');
    return true;
  }

  closeTierModal() {
    this.overlayElement.classList.remove('active')
  }

  setDefaultModalValues() {
    const defaultLabelColor = getComputedStyle(this.editableTier.firstElementChild).backgroundColor;
    this.colorsElements.forEach((item) => {
      if (item.style.backgroundColor === defaultLabelColor) {
        item.classList.add('chosen');
        this.chosenColorElement = item;
      }
    });

    const defaultLabelText = this.editableTier.children[0].textContent.trim();
    this.modalTextareaElement.value = defaultLabelText;
  }
}
new TierModal();


document.addEventListener('click', (evt) => {
  if (!evt.target.closest('.tier__move')){
    return
  }
  let currentTierElement = evt.target.closest('.tier')
  if (evt.target.classList.contains('tier__move-up')){
    currentTierElement.previousElementSibling.before(currentTierElement)
  } else if (evt.target.classList.contains('tier__move-down')){
    currentTierElement.nextElementSibling.after(currentTierElement)
  }
})