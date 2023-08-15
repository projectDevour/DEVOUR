const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progress = document.getElementById("progress");
const formSteps = document.querySelectorAll(".form-step");
const progressSteps = document.querySelectorAll(".progress-step");
const nextPrevBtn = document.getElementById("nextPrevBtn");
let formStepsNum = 0;
let formStepsArray = [];

//her adımı arraye atıyorum index olarak kullanabilmek için
formSteps.forEach((formStep) => {
  formStepsArray.push(formStep);
});


editNext(formStepsNum);
//next butonu bir sonraki sayfaya geçisi sağlıyor.
processBtn.addEventListener("click", () => {
  formStepsNum++;
  updateFormSteps();
  updateProgressBar();
  editNext(formStepsNum);
});

//prev butonu bir önceki sayfaya geçişi sağlıyor.
prevBtn.addEventListener("click", () => {
  formStepsNum--;
  updateFormSteps();
  updateProgressBar();
  editNext(formStepsNum);
});



//stepleri belirlememi sağlayan fonksiyon.
function updateFormSteps() {
  formSteps.forEach((formStep) => {
    formStep.classList.contains("form-step-active") &&
      formStep.classList.remove("form-step-active");
  });

  formSteps[formStepsNum].classList.add("form-step-active");
}

//progressbarı ilerletmemi sağlıyor.
function updateProgressBar() {
  progressSteps.forEach((progressStep, idx) => {
    if (idx < formStepsNum + 1) {
      progressStep.classList.add("progress-step-active");
    } else {
      progressStep.classList.remove("progress-step-active");
    }
  });
  const progressActive = document.querySelectorAll(".progress-step-active");

  progress.style.width =
    ((progressActive.length - 1) / (progressSteps.length - 1)) * 100 + "%";
}

function editNext(formStepsNum) {
  if ((formStepsArray[formStepsNum].classList.contains("result-page"))){
    //nextBtn.disabled =true;
    nextBtn.classList.add("resultBtn");
    prevBtn.style.display = "block";
    nextPrevBtn.style.justifyContent = "space-between";
  }else if((formStepsArray[formStepsNum].classList.contains("first-page"))){
    //nextBtn.disabled =true;
    prevBtn.style.display = "none";
    nextPrevBtn.style.justifyContent = "right";
  }else if(!(formStepsArray[formStepsNum].classList.contains("first-page"))){
    prevBtn.style.display = "block";
    nextPrevBtn.style.justifyContent = "space-between";
  }if((formStepsArray[formStepsNum].classList.contains("final-page"))){
    nextBtn.style.display = "none";

}
}
