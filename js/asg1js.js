document.addEventListener("DOMContentLoaded", function() {
    const countryString = "http://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php";
    const wrapDiv = document.querySelector("#credits");
    const filterBox = document.querySelector("#filterCompanies");
    const resultsList = document.querySelector("#companyList");
    const companyDetails = document.querySelector("#companyDetails");
    let creditLoop = true;
    let compList = [];
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

    document.querySelector('#popCompanyList').addEventListener('click', (e) => {
        fetchCoList();
    });
    document.querySelector('#clearFilter').addEventListener('click', (e) => {
        fetchCoList();
        filterBox.value = "";
    });
    document.querySelector('#resetCompanyList').addEventListener('click', (e) => {
        resetCoList();
    });
    document.querySelector('#companyList').addEventListener('click', (e) => {
        if (e.target.nodeName.toLowerCase() == 'li') {
            popCompanyInfo(e);
        }
    });
    document.querySelector('#filterCompanies').addEventListener('input', (e) => {
        if (e.target.value != "") {
            filterCompanies(e.target.value);
        }
    });

    function fetchCoList() {
        fetch(countryString).then(response => response.json()).then(data => {
            compList = [];
            compList.push(...data);
            popCoList(compList);
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
            if (companyListItem.target.innerHTML == c.name) {
                // const logo = document.createElement("");
                const symbol = document.createElement("p");
                const name = document.createElement("p");
                const sector = document.createElement("p");
                const subindustry = document.createElement("p");
                const address = document.createElement("p");
                const website = document.createElement("p");
                const exchange = document.createElement("p");
                const description = document.createElement("p");
                symbol.innerHTML = "Symbol: " + c.symbol;
                name.innerHTML = "Name: " + c.name;
                sector.innerHTML = "Sector: " + c.sector;
                subindustry.innerHTML = "SubIndustry: " + c.subindustry;
                address.innerHTML = "Address: " + c.address;
                website.innerHTML = "Website: " + c.website;
                exchange.innerHTML = "Exchange: " + c.exchange;
                description.innerHTML = "Description: " + c.description;
                companyDetails.appendChild(symbol);
                companyDetails.appendChild(name);
                companyDetails.appendChild(sector);
                companyDetails.appendChild(subindustry);
                companyDetails.appendChild(address);
                companyDetails.appendChild(website);
                companyDetails.appendChild(exchange);
                companyDetails.appendChild(description);
            }
        }
    }

    function filterCompanies(inputText) {
        console.log(String(inputText));
        let filterList = compList;
        filterList = compList.filter(word => word.name.toLowerCase().startsWith(inputText.toLowerCase()));
        popCoList(filterList);
    }
});