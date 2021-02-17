fetch('http://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php')
  .then(response => response.json())
  .then(data => console.log(data));

document.addEventListener("DOMContentLoaded", function() {
    const wrapDiv = document.querySelector("#credits");
    let creditLoop = true;
    document.querySelector('#header').addEventListener('mouseover', (e) => {
        if (e.target.nodeName.toLowerCase() == 'i') {
            if (creditLoop) {
                creditLoop = false;
                const names = document.createElement("div");
                const cont = true;
                names.innerHTML = "Created by Angela Li and Braedon Taylor";
                names.classList = "credit-class"
                wrapDiv.appendChild(names);
                setTimeout(function() {
                    creditLoop = true;
                    wrapDiv.removeChild(names);
                }, 5000);
            }
        }
    });
});