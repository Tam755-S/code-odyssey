// carousel.js

let slideIndex = 1;

// แสดง slide ตาม index
function showSlides(n) {
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");

    if (slides.length === 0) return;

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    slides[slideIndex-1].style.display = "flex";  
    if(dots.length > 0) dots[slideIndex-1].className += " active";
}

// เลื่อน slide ด้วยปุ่ม < >
function moveSlide(n) {
    showSlides(slideIndex += n);
}

// สร้าง dots แสดงสถานะ
function generateDots() {
    const slides = document.getElementsByClassName("slide");
    const dotsContainer = document.getElementById("carouselDots");
    if (!dotsContainer) return;

    dotsContainer.innerHTML = ''; 
    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement("span");
        dot.className = "dot";
        dotsContainer.appendChild(dot);
    }
    showSlides(slideIndex);
}

// เรียกใช้หลัง DOM โหลด
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(generateDots, 50);
});
