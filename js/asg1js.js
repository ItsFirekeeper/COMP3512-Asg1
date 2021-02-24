document.addEventListener("DOMContentLoaded", function() {
    const countryString = "http://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php";
    const wrapDiv = document.querySelector("#credits");
    const filterBox = document.querySelector("#filterCompanies");
    const resultsList = document.querySelector("#companyList");
    const companyDetails = document.querySelector("#companyDetails");
    const filterCompanies = document.querySelector("#filterCompanies");
    const companyList = document.querySelector("#list-companies");

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
    
    initMap();
    
    document.querySelector('#credits').addEventListener('mouseover', (e) => {
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

    document.querySelector('#popCompanyList').addEventListener('click', (e) => {
        fetchCoListInitial();
    });
    document.querySelector('#clearFilter').addEventListener('click', (e) => {
        refreshCoList();
        filterBox.value = "";
    });
    document.querySelector('#companyList').addEventListener('click', (e) => {
        if (e.target.nodeName.toLowerCase() == 'li') {
            popCompanyInfo(e);
            companyDetails.style.display = "block";
            moveMapMarker(e, worldMap);
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
    
    function moveMapMarker(companyListEvent, currentMap){
        console.log(companyListEvent.target.textContent);
        for (c of compList) {
            if (companyListEvent.target.textContent == c.name) {
                markerLatLong = {lat: c.latitude, lng: c.longitude };
                if(marker != null){
                    marker.setMap(null);
                    marker = null;
                }
                marker = new google.maps.Marker({
                    position: markerLatLong,
                    title: c.address,
                    map: currentMap
                });
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
});