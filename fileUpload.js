export function initFileUpload() {
  const fileInputElement = document.querySelector('.file__input');
  const poolElement = document.querySelector('.image-pool__items');

  fileInputElement.addEventListener('change', (evt) => {
    const files = evt.target.files;

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
  });
}