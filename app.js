const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const output = document.getElementById("output");

let drawing = false;

ctx.lineWidth = 8;
ctx.lineCap = "round";
ctx.strokeStyle = "white";

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener("mousemove", draw);

function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

document.getElementById("clearBtn").addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
});


document.getElementById("imageLoader").addEventListener("change", function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;

            ctx.drawImage(img, x, y, w, h);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
});


const shades = ["░","▒","▓","█"];

document.getElementById("compileBtn").addEventListener("click", () => {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const cellWidth = 8;
    const cellHeight = 12;

    let ascii = "";

    for (let y = 0; y < canvas.height; y += cellHeight) {
        for (let x = 0; x < canvas.width; x += cellWidth) {

            let top = 0, bottom = 0, left = 0, right = 0, total = 0, count = 0;

            for (let dy = 0; dy < cellHeight; dy++) {
                for (let dx = 0; dx < cellWidth; dx++) {
                    const px = x + dx;
                    const py = y + dy;
                    const i = (py * canvas.width + px) * 4;

                    const r = data[i];
                    const g = data[i+1];
                    const b = data[i+2];
                    const brightness = (r + g + b) / 3;

                    const val = 255 - brightness; // темное = больше массы

                    total += val;
                    count++;

                    if (dy < cellHeight/2) top += val;
                    else bottom += val;

                    if (dx < cellWidth/2) left += val;
                    else right += val;
                }
            }

            const avg = total / count;
            const densityLevel = Math.min(3, Math.floor(avg / 64));

            const topAvg = top / (count/2);
            const bottomAvg = bottom / (count/2);
            const leftAvg = left / (count/2);
            const rightAvg = right / (count/2);

            let char;

            if (topAvg > 160 && bottomAvg > 160) char = ".";
            else if (topAvg > 160) char = "█";
            else if (bottomAvg > 160) char = "█";
            else if (leftAvg > rightAvg * 1.3) char = "█";
            else if (rightAvg > leftAvg * 1.3) char = "█";
            else char = shades[densityLevel];

            ascii += char;
        }
        ascii += "\n";
    }

    output.value = ascii;
});


function showPage(page) {
    document.getElementById("mainPage").classList.add("hidden");
    document.getElementById("profilePage").classList.add("hidden");
    document.getElementById("supportPage").classList.add("hidden");

    if (page === "profile") document.getElementById("profilePage").classList.remove("hidden");
    if (page === "support") document.getElementById("supportPage").classList.remove("hidden");
}
