//elements
let hamburger = document.querySelector(".hamburger");
let firstPage = document.getElementById("firstPage");
let secondPage = document.getElementById("secondPage");
let firstPageBtn = document.getElementById("firstPageBtn");
let secondPageBtn = document.getElementById("secondPageBtn");


//elements events
hamburger.addEventListener("click", function(){
    document.querySelector("body").classList.toggle("active");
});

firstPageBtn.addEventListener("click",()=>{
    firstPage.style.display = "block";
    secondPage.style.display = "none";
});
secondPageBtn.addEventListener("click",()=>{
    secondPage.style.display = "block";
    firstPage.style.display = "none";
});