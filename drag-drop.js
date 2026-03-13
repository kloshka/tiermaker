export class DragAndDrop {
  initialState = {
    offsetX: null,
    offsetY: null,
    isDragging: false,
    currentDraggingElement: null,
    clone: null
  }

  selectors = {
    item: '.tier__item',
    container: '.items-container',
    label: '.tier__label'
  }

  constructor() {
    this.state = { ...this.initialState }
    this.bindEvents()
  }

onPointerDown(evt) {
  const { target, clientX, clientY } = evt

  if (target.closest(this.selectors.container)) {
    evt.preventDefault()
  }

  if (!target.classList.contains('tier__item')) return

  const { left, top } = target.getBoundingClientRect()

  const placeholder = target.cloneNode(true)
  placeholder.style.opacity = '0.5'
  target.before(placeholder)

  target.classList.add('tier__item--dragging')

  const { width, height } = getComputedStyle(target)
  Object.assign(target.style, {
    width,
    height,
    position: 'absolute',
    left: `${left}px`,
    top: `${top + scrollY}px`,
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
  const container = target.closest(this.selectors.container);
  if (!container) return;

  const { width: cW, height: cH, top: cTop } = container.getBoundingClientRect();
  const { width: eW, height: eH } = currentDraggingElement.getBoundingClientRect();

  const elementUnderCursor = document.elementFromPoint(clientX, clientY);

  const row = Math.ceil(Math.abs(clientY - cTop ) / eH);
  const rows = Math.round(cH / eH);
  const elemInRow = Math.floor(cW / eW);
  const index = row * elemInRow - 1;
  if (elementUnderCursor?.classList.contains('tier__item')) {
    this.insertRelativeToItem(elementUnderCursor, clientX, placeholder);
  } else if (container.children[index]) {
    container.children[index].after(placeholder); 
  } else {
    container.appendChild(placeholder);

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

  currentDraggingElement.classList.remove('tier__item--dragging')
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
