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

  const { clientX, clientY, pageX, pageY } = evt;
  const { currentDraggingElement, placeholder, offsetX, offsetY } = this.state;

  const newX = pageX - offsetX;
  const newY = pageY - offsetY;
  currentDraggingElement.style.left = `${newX}px`;
  currentDraggingElement.style.top = `${newY}px`;

  const target = evt.target;
  const container = target.closest('.tier__items');
  if (!container) return;

  const { width: cW, height: cH, top: cTop } = container.getBoundingClientRect();
  const { width: eW, height: eH } = currentDraggingElement.getBoundingClientRect();

  const elementUnderCursor = document.elementFromPoint(clientX, clientY);

  const row = Math.ceil((clientY - cTop) / eH);
  const rows = Math.round(cH / eH);
  const elemInRow = Math.floor(cW / eW);
  console.log(row, rows, elemInRow);

  if (elementUnderCursor?.classList.contains('tier__item')) {
    const { left, right } = elementUnderCursor.getBoundingClientRect();
    const centerX = (left + right) / 2;

    if (clientX <= centerX) {
      elementUnderCursor.before(placeholder);
    } else {
      elementUnderCursor.after(placeholder);
    }
  } else if (row === rows) {
    container.appendChild(placeholder);
  } else {
    const index = row * elemInRow - 1;
    container.children[index].after(placeholder);
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


const input = document.querySelector('.file__input')
const pool = document.querySelector('.tier__items--pool')
input.addEventListener('change', (evt) => {
  const files = evt.target.files

  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;

    const reader = new FileReader();

    reader.onload = (e) => {
      const div = document.createElement('div');
      div.className = 'tier__item';
      div.style.background = `url('${e.target.result}') center / cover no-repeat`;
      pool.appendChild(div);
    };
    reader.readAsDataURL(file);
  }
  input.value = '';
})











let editableTier;
let chosenColorEl;

const overlayElement = document.querySelector('.overlay')
const colorsElements = document.querySelectorAll('.modal__color-option')
document.addEventListener('click', (evt) => {
  if (evt.target.matches('.tier__settings-button')){
    overlayElement.classList.add('active')
    editableTier = evt.target.closest('.tier')


    const defaultColor = getComputedStyle(editableTier.firstElementChild).backgroundColor
    colorsElements.forEach((item) => {
      console.log(getComputedStyle(editableTier.firstElementChild).backgroundColor)
      if (item.style.backgroundColor == defaultColor){
        item.classList.add('chosen')
        chosenColorEl = item;
      }
    })
  }
})

const closeOverlayElement = document.querySelector('.modal__close-btn')
closeOverlayElement.addEventListener('click', (evt) => {
  overlayElement.classList.remove('active')
})




const modalColor = document.querySelector('.modal__color-select');
modalColor.addEventListener('click', (evt) => {  
  const newChosenColor = evt.target
  newChosenColor.classList.add('chosen');
  chosenColorEl.classList.remove('chosen')
  editableTier.firstElementChild.style.backgroundColor = newChosenColor.style.backgroundColor
  chosenColorEl = newChosenColor
})



const modalTextarea = document.querySelector('.modal__textarea')
modalTextarea.addEventListener('change', (evt) => {
  console.log(evt.target.value);
  editableTier.firstElementChild.textContent = evt.target.value
})

const modalBtns = document.querySelector('.modal__btns')
modalBtns.addEventListener('click', (evt) => {
  const btnText = evt.target.textContent
  if (btnText == 'Delete Row'){
    editableTier.remove()
    overlayElement.classList.remove('active')
    return
  } else if (btnText == 'Clear Row Images'){
    console.log(editableTier.children[1])
    editableTier.children[1].innerHTML = '' 
    return 
  } 
  let newTier = document.createElement('div')
  newTier.classList.add('tier')
  newTier.append(
    editableTier.children[0].cloneNode(), 
    editableTier.children[1].cloneNode(), 
    editableTier.children[2].cloneNode(true)
  )
  newTier.children[0].textContent = ""
  newTier.children[1].innerHTML = ''
  if (btnText == 'Add a Row Above') {
    editableTier.before(newTier)
  } else {
    editableTier.after(newTier)
  }
})