document.addEventListener("DOMContentLoaded", function() {
    const countryString = "http://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php";
    const stocksURL = "http://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=";
    const wrapDiv = document.querySelector("#credits");
    const filterBox = document.querySelector("#filterCompanies");
    const resultsList = document.querySelector("#companyList");
    const companyDetails = document.querySelector("#companyDetails");
    const filterCompanies = document.querySelector("#filterCompanies");
    const companyList = document.querySelector("#list-companies");
    const companyInfoHeader = document.querySelector("#company-info section h2");
    const stockDiv = document.querySelector("#stockFormDiv");
 
    let creditLoop = true;
    let compList = [];
    let stockData = [];
    let markerLatLong = {lat: null, lng: null };
    let marker = null;
    let worldMap = null;
    
    initDisplayElementHide()

    initMap();
    
    // hides elements on load
    function initDisplayElementHide() {
        filterCompanies.style.display = "none";
        filterLabel.style.display = "none";
        resultsList.style.display = "none";
        companyDetails.style.display = "none";
        companyInfoHeader.style.display = "none";
        stockDiv.style.display = "none";
        document.querySelector("#clearFilter").style.display = "none";
    }

    // Event listener for credit section at the top of the page - display names of developers
    document.querySelector('#credits').addEventListener('mouseover', (e) => {
        if (e.target.nodeName.toLowerCase() == 'i') {
            if (creditLoop) {
                creditLoop = false;
                const names = document.createElement("div");
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

    // Event listener for the "Go" button
    document.querySelector('#popCompanyList').addEventListener('click', (e) => {
        fetchCoListInitial();
        // localStorage.setItem("companies", "");
    });

    // Event listener for the "Clear Filter" button
    document.querySelector('#clearFilter').addEventListener('click', (e) => {
        refreshCoList();
        filterBox.value = "";
    });

    // Event listener for when a list element is clicked
    document.querySelector('#companyList').addEventListener('click', (e) => {
        if (e.target.nodeName.toLowerCase() == 'li') {
            highlightListItem(e);
            popCompanyInfo(e);
            fetchStocks(e);
            companyDetails.style.display = "block";
            moveMapMarker(e, worldMap);
        }
    });

    // Event listener for the "Filter" input box
    document.querySelector('#filterCompanies').addEventListener('input', (e) => {
        if (e.target.value != "") {
            filterCompaniesList(e.target.value);
        }
        else {
            popCoList(compList);
        }
    });
    
    // Move the map marker to the specified company location
    function moveMapMarker(companyListEvent, currentMap){
        for (c of compList) {
            if (companyListEvent.target.textContent == c.name) {
                markerLatLong = {lat: c.latitude, lng: c.longitude };
                if(marker != null){
                    marker.setMap(null);
                    marker = null;
                }
                worldMap.setZoom(12);
                marker = new google.maps.Marker({
                    position: markerLatLong,
                    title: c.address,
                    map: currentMap
                });
                worldMap.panTo(marker.position);
                break;
            }
        }
    }

    // Load map for the first time
    function initMap() {
        worldMap = new google.maps.Map(document.getElementById('map'), {
            center : {lat: 30.0599153, lng: 31.262019913},
            zoom: 1
        });
    }

    // Fetches the companies for the first time and sets appropriate states for related elements
    function fetchCoListInitial() {
        document.querySelector("#popCompanyList").style.display = "none";
        const loader = generateLoader();
        companyList.appendChild(loader);
        let compJ = localStorage.getItem("companies");
        if (!compJ) {
            console.log("fetch grabbing first time");
            fetch(countryString).then(response => response.json()).then(data => {
                let json = JSON.stringify(data);
                localStorage.setItem("companies", json);
                compList = JSON.parse(localStorage.getItem("companies"));
                popCoList(compList);
                companyList.removeChild(loader);
                filterCompanies.style.display = "block";
                filterLabel.style.display = "block";
                resultsList.style.display = "block";
                companyInfoHeader.style.display = "block";
                document.querySelector("#clearFilter").style.display = "block";
            } ).catch(error => console.error(error));
        }
        else {
            console.log("fetch grabbing from storage");
            compList = JSON.parse(compJ);
            popCoList(compList);
            companyList.removeChild(loader);
            filterCompanies.style.display = "block";
            filterLabel.style.display = "block";
            resultsList.style.display = "block";
            companyInfoHeader.style.display = "block";
            document.querySelector("#clearFilter").style.display = "block";
        }
    }

    // Refreshes the company data
    function refreshCoList() {
        let compJ = localStorage.getItem("companies");
        if (!compJ) {
            console.log("refresh grabbing first time");
            fetch(countryString).then(response => response.json()).then(data => {
                let json = JSON.stringify(data);
                localStorage.setItem("companies", json);
                compList = JSON.parse(localStorage.getItem("companies"));
                popCoList(compList);
            } ).catch(error => console.error(error));
        }
        else {
            console.log("refresh grabbing from storage");
            compList = JSON.parse(compJ);
            popCoList(compList);
        }
    }

    // Populates the company list given an array of companies
    function popCoList(popArray) {
        resultsList.innerHTML = "";
        for (let el of popArray) {
            let countryItem = document.createElement("li");
            countryItem.innerHTML = el.name;
            countryItem.setAttribute("id", "countryItem");
            resultsList.appendChild(countryItem);
        }
    }

    // Resets the list of companies
    function resetCoList() {
        resultsList.innerHTML = "";
        companyDetails.innerHTML = "";
    }

    // Populates the company information area
    function popCompanyInfo(companyListItem) {
        companyDetails.innerHTML = "";
        for (c of compList) {
            if (companyListItem.target.textContent == c.name) {
                if (c.symbol != "") {
                    let imgString = "../logos/" + c.symbol + ".svg";
                    console.log(imgString);
                    const logo = document.createElement("img");
                    const symbol = document.createElement("p");
                    const name = document.createElement("p");
                    const sector = document.createElement("p");
                    const subindustry = document.createElement("p");
                    const address = document.createElement("p");
                    const website = document.createElement("p");
                    const exchange = document.createElement("p");
                    const description = document.createElement("p");
                    logo.src = imgString;
                    logo.setAttribute("id", "logoPhoto");
                    symbol.textContent = `Symbol: ${c.symbol}`;
                    name.textContent = `Name: ${c.name}`;
                    sector.textContent = `Sector: ${c.sector}`;
                    subindustry.textContent = `SubIndustry: ${c.subindustry}`;
                    address.textContent = `Address: ${c.address}`;
                    website.textContent = `Website: ${c.website}`;
                    exchange.textContent = `Exchange: ${c.exchange}`;
                    description.textContent = `Description: ${c.description}`;
                    companyDetails.appendChild(logo);
                    companyDetails.appendChild(symbol);
                    companyDetails.appendChild(name);
                    companyDetails.appendChild(sector);
                    companyDetails.appendChild(subindustry);
                    companyDetails.appendChild(address);
                    companyDetails.appendChild(website);
                    companyDetails.appendChild(exchange);
                    companyDetails.appendChild(description);
                }
                else {
                    const notFound = document.createElement("p");
                    notFound.innerHTML = "Details are not available at this time";
                    companyDetails.appendChild(notFound);
                }
            }
        }
    }

    // Filters the list of companies given input text
    function filterCompaniesList(inputText) {
        console.log(String(inputText));
        let filterList = compList;
        filterList = compList.filter(word => word.name.toLowerCase().startsWith(inputText.toLowerCase()));
        popCoList(filterList);
    }
    
    // Creates a loader and returns it
    function generateLoader() {
        // The following code was inspired by https://epic-spinners.epicmax.co/ 
        // All credit goes to Epicmax and Vasili Savitski
        const outerDiv = document.createElement("div");
        outerDiv.className = "orbit-spinner";
        for (let i = 0; i < 3; i++) {
            const innerDiv = document.createElement("div");
            innerDiv.className = "orbit";
            outerDiv.appendChild(innerDiv);
        }
        return outerDiv;
        // End of code inspired by https://epic-spinners.epicmax.co/
        // credit to Epicmax and Vasili Savitski
    }

    // Highlights a list item that it is passed through css
    function highlightListItem(companyListItem){
      let activeList = document.querySelectorAll('.active');
        for(let a of activeList){
            a.classList.remove("active");
        }
        companyListItem.target.classList.add('active');
    }

    // Fetches stock data based on the list item passed
    function fetchStocks(stock) {
        for (c of compList) {
            if (stock.target.textContent == c.name) {
                localStorage.setItem("stockdata", "");
                queryString = stocksURL + c.symbol
                let stockJ = localStorage.getItem("stockdata");
                if (!stockJ) {
                    fetch(queryString).then(response => response.json()).then(data => {
                        let json = JSON.stringify(data);
                        localStorage.setItem("stockdata", json);
                        stockData = JSON.parse(localStorage.getItem("stockdata"));
                        stockDiv.style.display = "block";
                        popStockData(stockData);
                    } ).catch(error => console.error(error));
                }
                else {
                    stockData = JSON.parse(stockJ);
                    popStockData(stockData);
                }
            }
        }
    }

    function popStockData(sD) {
        stockFormDiv.innerHTML = "";
        const tbl = document.createElement("table")
        const trHeader = document.createElement("tr")
        const dateHeader = document.createElement("th")
        const openHeader = document.createElement("th")
        const closeHeader = document.createElement("th")
        const lowHeader = document.createElement("th")
        const highHeader = document.createElement("th")
        const volHeader = document.createElement("th")
        for (stockListing in sD) {
            sDate = 
            sOpen = 
            sClose = 
            sLow = 
            sHigh = 
            sVol = 
            stockListing.date
            stockListing.open
            stockListing.close
            stockListing.low
            stockListing.high
            stockListing.volume
        }
        
    }
});
