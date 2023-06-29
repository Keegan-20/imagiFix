//creating variables
const fileInput = document.querySelector("#imageFileInput");
const canvas = document.querySelector("#canvas");
const canvasContext = canvas.getContext("2d");
const brightnessInput = document.getElementById('brightness');//user inputs
const saturationInput = document.getElementById('saturation');
const contrastInput = document.getElementById('contrast');
const blurInput = document.getElementById('blur');
const inversionInput = document.getElementById('inversion');
const opacityInput = document.getElementById('opacity');
const cropButton = document.getElementById('cropButton'); //crop feature
const cropArea = document.querySelector("#cropArea");
const tempCanvas = document.createElement('canvas');
const tempContext = tempCanvas.getContext('2d');
const errorMessage = document.getElementById("error-message");

//range input user value
const brightnessRangeValue = document.getElementById('brightnessValue');
const saturationRangeValue = document.getElementById('saturationValue');
const contrastRangeValue = document.getElementById('contrastValue');
const blurRangeValue = document.getElementById('blurValue');
const inversionRangeValue = document.getElementById('inversionValue');
const opacityRangeValue = document.getElementById('opacityValue');
let outputTags = document.getElementsByTagName("output");
let inputTags = document.getElementsByTagName("input");

const settings = {}; // this empty object  will store all the user inputs for brightness,blur ,saturation etc.
let image = null; //will store the currently selected image by default when page load  the user has not selected any image so its deafult value is  Null
let flipHorizontal = false;
let flipVertical = false;

//reseting the filters
function resetSettings() {
    settings.brightness = "100";
    settings.saturation = "100";
    settings.contrast = "100";
    settings.blur = "0";
    settings.inversion = "0";
    settings.opacity = "100";
    //to restore to default values when we select a new image
    brightnessInput.value = settings.brightness;
    saturationInput.value = settings.saturation;
    contrastInput.value = settings.contrast;
    blurInput.value = settings.blur;
    inversionInput.value = settings.inversion;
    opacityInput.value = settings.opacity;
}

// displaying range input values according to user input
brightnessInput.addEventListener('input', function () {
    brightnessRangeValue.textContent = brightnessInput.value;
});
saturationInput.addEventListener('input', function () {
    saturationRangeValue.textContent = saturationInput.value;
});
contrastInput.addEventListener('input', function () {
    contrastRangeValue.textContent = contrastInput.value;
});
blurInput.addEventListener('input', function () {
    blurRangeValue.textContent = blurInput.value;
});
inversionInput.addEventListener('input', function () {
    inversionRangeValue.textContent = inversionInput.value;
});

//opacity filter to keep value between  0 to 1
opacityInput.addEventListener("input", function () {
    let opacity = opacityInput.value / 100;
    opacityRangeValue.textContent = opacity;
});

// Iitial image placeholder preview
const imgPlaceholder = new Image();
imgPlaceholder.onload = function () {
    canvasContext.drawImage(imgPlaceholder, 0, 0, canvas.width, canvas.height);
};
imgPlaceholder.src = "./img/image-placeholder.svg";


//updating the settings
function updateSetting(key, value) {
    if (!image) {
        displayErrorMessage();

        for (let i = 0; i < outputTags.length; i++) {
            outputTags[i].textContent = "";
            outputTags[i].disabled = true;
        }


        for (let i = 0; i < inputTags.length; i++) {
            if (inputTags[i].type === "range") {
                inputTags[i].disabled = true;
            }
        }

        return;
    }
    settings[key] = value;
    renderImage();
}


//displaying an error message
function displayErrorMessage() {
    errorMessage.textContent = "Please select an image to begin editing!!";
}

// Clear any existing error message after selecting the image
fileInput.addEventListener("change", () => {
    errorMessage.textContent = "";
})

// Rendering the image on the canvas
function renderImage() {
    if (!image) {
        return displayErrorMessage("Please select an image to begin editing!!");
    }
    
    const maxDimension = Math.max(image.width, image.height);
    canvas.width = maxDimension;
    canvas.height = maxDimension;

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    

    canvasContext.save();
    canvasContext.translate(canvas.width / 2, canvas.height / 2);
    canvasContext.rotate((rotationAngle * Math.PI) / 180);

    //flip image feature
    if (flipHorizontal) {
        canvasContext.scale(-1, 1);  //width turned to opposite value
    }
    if (flipVertical) {
        canvasContext.scale(1, -1); //height turned to opposite value
    }

// Apply crop area
if (startX !== undefined && startY !== undefined && endX !== undefined && endY !== undefined) {
    const width = endX - startX;
    const height = endY - startY;
    canvasContext.drawImage(image, startX, startY, width, height, -width / 2, -height / 2, width, height);
  } else {
    canvasContext.drawImage(image, -image.width / 2, -image.height / 2);
  }

  // Apply text overlay
  canvasContext.fillStyle = textOverlay.color;
  canvasContext.font = `${textOverlay.size}px Arial`;
  canvasContext.fillText(textOverlay.content, textOverlay.x, textOverlay.y);

  canvasContext.restore();
  canvasContext.filter = generateFilter();
  canvasContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);
}



function generateFilter() {
    const {
        brightness, saturation,
        contrast, blur,
        inversion, opacity
    } = settings;

    return `brightness(${brightness}% ) saturate(${saturation}%) contrast(${contrast}%) blur(${blur}px) invert(${inversion}%) opacity(${opacity}%)`;
}

//updating and saving the values given by the user
brightnessInput.addEventListener("input", () => updateSetting("brightness", brightnessInput.value));
saturationInput.addEventListener("input", () => updateSetting("saturation", saturationInput.value));
contrastInput.addEventListener("input", () => updateSetting("contrast", contrastInput.value));
blurInput.addEventListener("input", () => updateSetting("blur", blurInput.value));
inversionInput.addEventListener("input", () => updateSetting("inversion", inversionInput.value));
opacityInput.addEventListener("input", () => updateSetting("opacity", opacityInput.value));

//selection of a file using fileInput element
fileInput.addEventListener("change", () => {
    image = new Image();
    image.addEventListener("load", () => {

        resetSettings();
        renderImage();

        // Image is selected, enable the filters
        for (let i = 0; i < outputTags.length; i++) {
            outputTags[i].disabled = false;
        }

        for (let i = 0; i < inputTags.length; i++) {
            inputTags[i].disabled = false;
        }

    });
    image.src = URL.createObjectURL(fileInput.files[0]);
});

resetSettings();

//rotate Image feature
const rotateLeftButton = document.getElementById('rotateLeftButton');
const rotateRightButton = document.getElementById('rotateRightButton');
let rotationAngle = 0;

function rotateImage(angle) {
    if (!image) {
        return displayErrorMessage();
    }
    rotationAngle += angle;

    //checking if rotatiom angle is within 0 to 359
    if (rotationAngle >= 360) {
        rotationAngle %= 360;
    }
    else if (rotationAngle < 0) {
        rotationAngle = (rotationAngle % 360) + 360;
    }

    tempCanvas.width = Math.max(image.width, image.height);
    tempCanvas.height = Math.max(image.width, image.height);

    tempContext.save();
    tempContext.translate(tempCanvas.width / 2, tempCanvas.height / 2); //rendering context to the center of the canvas
    tempContext.rotate((rotationAngle * Math.PI) / 180); // The angle is converted from degrees to radians

    tempContext.drawImage(
        image,
        -image.width / 2,
        -image.height / 2
    );
    tempContext.restore();
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    canvasContext.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
    renderImage();
}
rotateLeftButton.addEventListener('click', () => rotateImage(-90));
rotateRightButton.addEventListener('click', () => rotateImage(90));


//Flip Image feature
const flipHorizontalButton = document.getElementById("flipHorizontal");
flipHorizontalButton.addEventListener("click", () => {
    flipHorizontal = !flipHorizontal;
    renderImage();
});

// Flip Vertical button click event
const flipVerticalButton = document.getElementById("flipVertical");
flipVerticalButton.addEventListener("click", () => {
    flipVertical = !flipVertical;
    renderImage();
});

       // Add Text Feature
const textOverlayButton = document.getElementById("textOverlayButton");
const textOverlayOptions = document.getElementById("textOverlayOptions");
const textSizeInput = document.getElementById("textSize");
const textSizeValue = document.getElementById("textSizeValue");
const addTextButton = document.getElementById("addTextButton");

// Toggle the add text icon
textOverlayButton.addEventListener("click", () => {
    textOverlayButton.classList.toggle("active");
});

closeButton.addEventListener("click", () => {
    textOverlayButton.classList.remove("active");
})

   // Update text size value
textSizeInput.addEventListener("input", () => {
    textSizeValue.textContent = textSizeInput.value;
});



// Global variable declaration
let textOverlay = {
    content: "",
    color: "#000000",
    size: 12,
    x: 0,
    y: 0
  };
  
  
  // Function to update text overlay and trigger rendering
  function drawTextOverlay(content, color, size, x, y) {
    textOverlay.content = content;
    textOverlay.color = color;
    textOverlay.size = size;
    textOverlay.x = x;
    textOverlay.y = y;
    renderImage();
  }
  
  addTextButton.addEventListener("click", () => {
    const textContent = document.getElementById("textContent").value;
    const textColor = document.getElementById("textColor").value;
    const textSize = parseInt(textSizeInput.value);
  
      //selecting co-ordinates depending on user click
      canvas.addEventListener('click', function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
     drawTextOverlay(textContent, textColor, textSize, x, y);
    });
  });
 
  //Crop
  let startX, startY, endX, endY;
let isCropMode = false; // Flag to indicate if the crop mode is enabled

// Function to handle mouse down event
function handleMouseDown(event) {
  if (isCropMode) {
    const rect = canvas.getBoundingClientRect();
    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
  }
}

// Function to handle mouse move event
function handleMouseMove(event) {
  if (isCropMode && startX !== undefined && startY !== undefined) {
    const rect = canvas.getBoundingClientRect();
    endX = event.clientX - rect.left;
    endY = event.clientY - rect.top;
    drawCrosshair(startX, startY, endX, endY);
    
  }
}

// Function to handle mouse up event
function handleMouseUp() {
  if (isCropMode && startX !== undefined && startY !== undefined && endX !== undefined && endY !== undefined) {
    cropImage(startX, startY, endX, endY);
    startX = startY = endX = endY = undefined;
    canvas.style.cursor = 'crosshair';
  }
}

// Function to draw the crop area
function drawCrosshair(startX, startY, endX, endY) {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
     canvasContext.drawImage(image, 0, 0);
     canvasContext.beginPath();
     canvasContext.moveTo(startX, 0);
     canvasContext.lineTo(startX, canvas.height);
     canvasContext.moveTo(0, startY);
     canvasContext.lineTo(canvas.width, startY);
     canvasContext.strokeStyle = 'red';
     canvasContext.lineWidth = 1;
     canvasContext.stroke();
     canvasContext.fillStyle = 'rgba(255, 0, 0, 0.2)';
     canvasContext.fillRect(startX, startY, endX - startX, endY - startY);
  }
  
// Function to crop the image
function cropImage(startX, startY, endX, endY) {

    let tempCanvas = document.createElement('canvas');
    let tempContext = tempCanvas.getContext('2d');
    let width = endX - startX;
    let height = endY - startY;
  
    tempCanvas.width = width;
    tempCanvas.height = height;
  
    // Apply transformations and filters to the temporary canvas
    tempContext.save();
    tempContext.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempContext.rotate((rotationAngle * Math.PI) / 180);
    
    if (flipHorizontal) {
      tempContext.scale(-1, 1);
    }
    if (flipVertical) {
      tempContext.scale(1, -1);
    }
    
    tempContext.drawImage(
      image,
      startX, startY, width, height,
      -width / 2, -height / 2, width, height
    );
    tempContext.restore();
    tempContext.filter = generateFilter();
    tempContext.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
  
    // Convert the resulting image data to a data URL and create a new image
    let croppedImage = new Image();
    croppedImage.onload = function() {
      resetSettings();
      renderImage();
    };
    croppedImage.src = tempCanvas.toDataURL();
  
    // Update the image variable with the cropped image
    image = croppedImage;
  }
  
  // Event listener for crop button click
cropButton.addEventListener('click', function() {
  isCropMode = !isCropMode; // Toggle the value of isCropMode
  if (isCropMode) {
    cropButton.textContent = "Save Crop";
    canvas.style.cursor = 'crosshair';
  }
else {
    cropButton.textContent = "Crop";
    canvas.style.cursor = 'auto';
    startX = startY = endX = endY = undefined; // Reset the crop area
    renderImage();
  }
});


// Add event listeners for mouse events
canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
