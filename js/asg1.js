document.addEventListener("DOMContentLoaded", function() {
    const countryString = "http://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php";
    const stocksURL = "http://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol=";
    const wrapDiv = document.querySelector("#credits");
    const filterBox = document.querySelector("#filterCompanies");
    const resultsList = document.querySelector("#companyList");
    const companyDetails = document.querySelector("#companyDetails");
    const filterCompanies = document.querySelector("#filterCompanies");
    const companyList = document.querySelector("#list-companies");
    
    const stockDetails = document.querySelector("#stock-details");

    filterCompanies.style.display = "none";
    filterLabel.style.display = "none";
    resultsList.style.display = "none";
    companyDetails.style.display = "none";
    document.querySelector("#clearFilter").style.display = "none";
     
    let creditLoop = true;
    let compList = [];
    let markerLatLong = {lat: null, lng: null };
    let marker = null;
    let worldMap = null;
    let stockInfo = [];
    
    initMap();
    
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

    document.querySelector('#popCompanyList').addEventListener('click', (e) => {
        fetchCoListInitial();
    });
    document.querySelector('#clearFilter').addEventListener('click', (e) => {
        refreshCoList();
        filterBox.value = "";
    });
    document.querySelector('#companyList').addEventListener('click', (e) => {
        if (e.target.nodeName.toLowerCase() == 'li') {
            highlightListItem(e);
            popCompanyInfo(e);
            companyDetails.style.display = "block";
            moveMapMarker(e, worldMap);
            fetchStockInfo(e);
        }
    });
    document.querySelector('#filterCompanies').addEventListener('input', (e) => {
        if (e.target.value != "") {
            filterCompaniesList(e.target.value);
        }
        else {
            popCoList(compList);
        }
    });
    
    function fetchStockInfo(companyListEvent){
        
//        stockDetails.style.display = "none";
//        const stockLoader = generateLoader();
//        stockDetails.appendChild(stockLoader);
        
        let selectedCompany = getSelectedCompany(companyListEvent);
        if(selectedCompany != null){
        const currentStockURL = stocksURL.concat(selectedCompany.symbol);
            fetch(currentStockURL).then(response => {
                if (response.ok) {
                    return response.json();
                } 
                else {
                    return Promise.reject // the problem here is that Promise.reject should be a function ... 
                ({
                    status: response.status,
                    statusText: response.statusText
                });
                }
            }).then(data => {

            stockInfo = [];
            stockInfo.push(...data);
            console.log(stockInfo);
            createStockTable(stockInfo);
        } ).catch(function (error) {
            console.log(error);
        });
     
    }
    }
    
    function createStockTable(stockInfo){
        
        const tableBody = document.querySelector("tbody");
        for(let stock of stockInfo){
            
            const row = document.createElement("tr");
            
            const tdDate = document.createElement("td");
            tdDate.textContent = stock.date;
            
            row.appendChild(tdDate);
            
            const tdOpen = document.createElement("td");
            tdOpen.textContent = stock.open;
            
            row.appendChild(tdOpen);

            const tdClose = document.createElement("td");
            tdClose.textContent = stock.close;

            row.appendChild(tdClose);
            
            const tdLow = document.createElement("td");
            tdLow.textContent = stock.Low;

            row.appendChild(tdLow);
            
            const tdHigh = document.createElement("td");
            tdHigh.textContent = stock.high;

            row.appendChild(tdHigh);
            
            const tdVolume = document.createElement("td");
            tdVolume.textContent = stock.volume;
            
            row.appendChild(tdVolume);


            tableBody.appendChild(row);
            
        }
        
    }
    
    function getSelectedCompany(companyListEvent){
        let selectedCompany = compList.find(company => company.name == companyListEvent.target.textContent);
        return selectedCompany;
        
    }
    
    function moveMapMarker(companyListEvent, currentMap){
        console.log(companyListEvent.target.textContent);
        for (c of compList) {
            if (companyListEvent.target.textContent == c.name) {
                markerLatLong = {lat: c.latitude, lng: c.longitude };
                if(marker != null){
                    marker.setMap(null);
                    marker = null;
                }
                worldMap.setZoom(6);
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

    function initMap() {
        worldMap = new google.maps.Map(document.getElementById('map'), {
            center : {lat: 30.0599153, lng: 31.262019913},
            zoom: 1
        });
    }

    function refreshCoList() {
        fetch(countryString).then(response => response.json()).then(data => {
            compList = [];
            compList.push(...data);
            popCoList(compList);
        } ).catch(error => console.error(error));
    }

    function fetchCoListInitial() {
        document.querySelector("#popCompanyList").style.display = "none";
        const loader = generateLoader();
        companyList.appendChild(loader);
        fetch(countryString).then(response => response.json()).then(data => {
            compList = [];
            compList.push(...data);
            popCoList(compList);
            companyList.removeChild(loader);
            filterCompanies.style.display = "block";
            filterLabel.style.display = "block";
            resultsList.style.display = "block";
            document.querySelector("#clearFilter").style.display = "block";
        } ).catch(error => console.error(error));
    }

    function popCoList(popArray) {
        resultsList.innerHTML = "";
        for (let el of popArray) {
            let countryItem = document.createElement("li");
            countryItem.innerHTML = el.name;
            countryItem.setAttribute("id", "countryItem");
            resultsList.appendChild(countryItem);
        }
    }

    function resetCoList() {
        resultsList.innerHTML = "";
        companyDetails.innerHTML = "";
    }

    function popCompanyInfo(companyListItem) {
        companyDetails.innerHTML = "";
        for (c of compList) {
            if (companyListItem.target.textContent == c.name) {
                if (c.symbol != "") {
                    // const logo = document.createElement("");
                    const symbol = document.createElement("p");
                    const name = document.createElement("p");
                    const sector = document.createElement("p");
                    const subindustry = document.createElement("p");
                    const address = document.createElement("p");
                    const website = document.createElement("p");
                    const exchange = document.createElement("p");
                    const description = document.createElement("p");
                    symbol.textContent = `Symbol: ${c.symbol}`;
                    name.textContent = `Name: ${c.name}`;
                    sector.textContent = `Sector: ${c.sector}`;
                    subindustry.textContent = `SubIndustry: ${c.subindustry}`;
                    address.textContent = `Address: ${c.address}`;
                    website.textContent = `Website: ${c.website}`;
                    exchange.textContent = `Exchange: ${c.exchange}`;
                    description.textContent = `Description: ${c.description}`;
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

    function filterCompaniesList(inputText) {
        console.log(String(inputText));
        let filterList = compList;
        filterList = compList.filter(word => word.name.toLowerCase().startsWith(inputText.toLowerCase()));
        popCoList(filterList);
    }
      
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

    function highlightListItem(companyListItem){
      let activeList = document.querySelectorAll('.active');
        for(let a of activeList){
            a.classList.remove("active");
        }
        companyListItem.target.classList.add('active');
    }
});
