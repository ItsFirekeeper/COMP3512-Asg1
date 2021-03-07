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
    const stockDivSecondary = document.querySelector("#stockFormSecondary");
 
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
        if (e.target.nodeName.toLowerCase() == 'i' || e.target.nodeName.toLowerCase() == 'h3') {
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

    //code inspired by https://flaviocopes.com/how-to-add-event-listener-multiple-elements-javascript/
    document.querySelectorAll('.toggleChartButton').forEach(btn => {
        btn.addEventListener('click', (e) => {
            toggleChartView();
        });
    });
    
    document.querySelector('#stockFormDiv').addEventListener('click', (e) => {
        if (e.target.nodeName.toLowerCase() == 'th') {
            sortStocks(e.target.innerHTML);
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
            fetch(countryString).then(response => response.json()).then(data => {
                let json = JSON.stringify(data);
                localStorage.setItem("companies", json);
                compList = JSON.parse(localStorage.getItem("companies"));
                popCoList(compList);
            } ).catch(error => console.error(error));
        }
        else {
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
                        popStockSecondary(stockData);
                    } ).catch(error => console.error(error));
                }
                else {
                    stockData = JSON.parse(stockJ);
                    popStockData(stockData);
                    popStockSecondary(stockData);
                }
            }
        }
    }

    function popStockData(sD) {
        stockDiv.innerHTML = "";
        const tbl = document.createElement("table");
        stockHd = stockHeader();
        tbl.appendChild(stockHd);
        for (stockListing of sD) {
            const trStockRow = document.createElement("tr");
            const dateVal = document.createElement("td");
            const openVal = document.createElement("td");
            const closeVal = document.createElement("td");
            const lowVal = document.createElement("td");
            const highVal = document.createElement("td");
            const volVal = document.createElement("td");
            dateVal.innerHTML = stockListing.date;
            openVal.innerHTML = stockListing.open;
            closeVal .innerHTML = stockListing.close;
            lowVal.innerHTML = stockListing.low;
            highVal.innerHTML = stockListing.high;
            volVal.innerHTML = stockListing.volume;
            trStockRow.appendChild(dateVal);
            trStockRow.appendChild(openVal);
            trStockRow.appendChild(closeVal);
            trStockRow.appendChild(lowVal);
            trStockRow.appendChild(highVal);
            trStockRow.appendChild(volVal);
            tbl.appendChild(trStockRow);
        }
        stockDiv.appendChild(tbl);
    }

    function stockHeader() {
        const trHeader = document.createElement("tr");
        const dateHeader = document.createElement("th");
        const openHeader = document.createElement("th");
        const closeHeader = document.createElement("th");
        const lowHeader = document.createElement("th");
        const highHeader = document.createElement("th");
        const volHeader = document.createElement("th");
        dateHeader.innerHTML = "Date";
        openHeader.innerHTML = "Open";
        closeHeader .innerHTML = "Close";
        lowHeader.innerHTML = "Low";
        highHeader.innerHTML = "High";
        volHeader.innerHTML = "Volume";
        trHeader.appendChild(dateHeader);
        trHeader.appendChild(openHeader);
        trHeader.appendChild(closeHeader);
        trHeader.appendChild(lowHeader);
        trHeader.appendChild(highHeader);
        trHeader.appendChild(volHeader);
        return trHeader;
    }

    function toggleChartView() {
        const main = document.querySelector("#mainView");
        const chart = document.querySelector("#chartView");
        if (main.classList.contains("showSection") && chart.classList.contains("hideSection")) {
            main.classList.remove("showSection");
            main.classList.add("hideSection");
            chart.classList.remove("hideSection");
            chart.classList.add("showSection");
        }
        else {
            main.classList.remove("hideSection");
            main.classList.add("showSection");
            chart.classList.remove("showSection");
            chart.classList.add("hideSection");
        }
    }

    function sortStocks(sortType) {
        if (sortType == "Date") {
            const dateSort = stockData.sort( function(a,b) {
                if (a.date < b.date) {
                    return -1;
                }
                else if (a.date > b.date) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            popStockData(dateSort);
        }
        else if (sortType == "Open") {
            const openSort = stockData.sort( function(a,b) {
                if (a.open < b.open) {
                    return -1;
                }
                else if (a.open > b.open) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            popStockData(openSort);
        }
        else if (sortType == "Close") {
            const closeSort = stockData.sort( function(a,b) {
                if (a.close < b.close) {
                    return -1;
                }
                else if (a.close > b.close) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            popStockData(closeSort);
        }
        else if (sortType == "Low") {
            const lowSort = stockData.sort( function(a,b) {
                if (a.low < b.low) {
                    return -1;
                }
                else if (a.low > b.low) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            popStockData(lowSort);
        }
        else if (sortType == "High") {
            const highSort = stockData.sort( function(a,b) {
                if (a.high < b.high) {
                    return -1;
                }
                else if (a.high > b.high) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            popStockData(highSort);
        }
        else if (sortType == "Volume") {
            const volSort = stockData.sort( function(a,b) {
                if (a.volume < b.volume) {
                    return -1;
                }
                else if (a.volume > b.volume) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            popStockData(volSort);
        }
    }

    function popStockSecondary(sD) {
        stockDivSecondary.innerHTML = "";
        let secondaryArray = [
            ["open", generateValArray(sD, "open")], 
            ["close", generateValArray(sD, "close")], 
            ["low", generateValArray(sD, "low")], 
            ["high", generateValArray(sD, "high")], 
            ["volume", generateValArray(sD, "volume")]
        ];
        let tblArray = [];
        for (ar of secondaryArray) {
            const colName = ar[0];
            const mMA = genMinMaxAvg(ar[1]);
            const min = mMA[0];
            const max = mMA[1];
            const avg = mMA[2];
            tblArray.push([mMA[0], mMA[1], mMA[2]]);
        }
        tblArray = tableFlip(tblArray);
        console.log(tblArray);
        const tbl = document.createElement("table");
        const headerRow = document.createElement("tr");
        const blankHeader = document.createElement("th"); 
        const openHeader = document.createElement("th");
        const closeHeader = document.createElement("th");
        const lowHeader = document.createElement("th");
        const highHeader = document.createElement("th");
        const volHeader = document.createElement("th");
        headerRow.appendChild(blankHeader);
        headerRow.appendChild(openHeader);
        headerRow.appendChild(closeHeader);
        headerRow.appendChild(lowHeader);
        headerRow.appendChild(highHeader);
        headerRow.appendChild(volHeader);
        tbl.appendChild(headerRow);
        for (row of tblArray) {
            const rw = document.createElement("tr");
            const open = document.createElement("th"); 
            const close = document.createElement("th");
            const low = document.createElement("th");
            const high = document.createElement("th");
            const vol = document.createElement("th");
            open.textContent = row[0];
            close.textContent = row[1];
            low.textContent = row[2];
            high.textContent = row[3];
            vol.textContent = row[4];
            rw.appendChild(open);
            rw.appendChild(close);
            rw.appendChild(low);
            rw.appendChild(high);
            rw.appendChild(vol);
            tbl.appendChild(rw);
        }
        stockDivSecondary.appendChild(tbl);
    }

    function generateValArray(array, prop) {
        let returnArray = [];
        for (ele of array) {
            returnArray.push(ele[prop]);
        }
        return returnArray;
    }

    function genMinMaxAvg(valArray) {
        let sum = 0;
        for (v of valArray) {
            sum += parseFloat(v);
        }
        let avg = sum / valArray.length;
        // referred to https://medium.com/@vladbezden/how-to-get-min-or-max-of-an-array-in-javascript-1c264ec6e1aa for specific use information
        const retArray = [Math.min(...valArray), Math.max(...valArray), avg];
        return retArray;
    }

    function tableFlip(array) {
        const rowCount = array.length;
        const colCount = array[0].length;
        retArray = [[],[],[]];
        for (let row = 0; row < rowCount; row++) {
            for (let col = 0; col < colCount; col++) {
                retArray[col][row] = array[row][col];
            }
        }
        return retArray;
    }
});
