import { DragAndDrop } from "./drag-drop.js"
import { TierModal } from "./tiermodal.js"
import { TierList } from "./tierControls.js";
import { initFileUpload } from "./fileUpload.js";

new DragAndDrop();
new TierModal();
new TierList();
initFileUpload();
const header = document.querySelector('.header');
const burgerButton = document.querySelector('.burger-button');
const burgerMenuElement = document.querySelector('.header__burger-menu');
function setBurgerTop() {
    const headerHeight = header.getBoundingClientRect().height;
    burgerMenuElement.style.top = headerHeight + 'px';
}

window.addEventListener('load', setBurgerTop);
window.addEventListener('resize', setBurgerTop);

burgerButton.addEventListener('click', (evt) => {
    burgerMenuElement.classList.toggle('header__burger-menu--active');    
    document.documentElement.classList.toggle("hidden");
})

const mediaQuery = window.matchMedia('(max-width: 540px)');

function closeBurgerOnDesktop() {
    if (!mediaQuery.matches) { 
        burgerMenuElement.classList.remove('header__burger-menu--active');
        document.documentElement.classList.remove("hidden");
    }
}

mediaQuery.addEventListener('change', closeBurgerOnDesktop);