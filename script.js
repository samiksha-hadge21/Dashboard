const apiKey = '67e6f24ad980b3.01408533'; 

let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

document.getElementById('fetchData').addEventListener('click', fetchStockData);

function fetchStockData() {
    const query = document.getElementById('query').value.toLowerCase();
    let symbol;

    
    if (query.includes('amazon') || query.includes('amzn')) {
        symbol = 'AMZN';
    } else if (query.includes('apple') || query.includes('aapl')) 
        symbol = 'AAPL';
    } else if (query.includes('tesla') || query.includes('tsla')) {
        symbol = 'TSLA';
    } else if (query.includes('microsoft') || query.includes('msft')) {
        symbol = 'MSFT';
    } else if (query.includes('google') || query.includes('googl')) {
        symbol = 'GOOGL';
    } else {
        alert('Sorry, no matching company found for your query!');
        return;
    }

    if (!searchHistory.includes(query)) {
        searchHistory.push(query);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

  
    const url = `https://eodhistoricaldata.com/api/eod/${symbol}.US?api_token=${apiKey}&period=d`;

    fetch(url)
        .then(response => response.text())  // Use .text() to get CSV format
        .then(csvData => {
           
            Papa.parse(csvData, {
                complete: function(results) {
                    const data = results.data;
                    const dates = data.map(entry => entry[0]);
                    const closingPrices = data.map(entry => entry[4]);

                    if (dates.length > 0 && closingPrices.length > 0) {
                        displayChart(dates, closingPrices);
                    } else {
                        alert('No data available for this query!');
                    }
                },
                error: function(error) {
                    console.error('CSV Parsing Error:', error);
                    alert('Error parsing CSV data!');
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));

   
    displayHistory();
}


function displayChart(dates, closingPrices) {
    const ctx = document.getElementById('stock').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Stock Closing Price',
                data: closingPrices,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        maxRotation: 90,
                        minRotation: 45
                    }
                }
            }
        }
    });
}


function displayHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';  

    searchHistory.forEach(query => {
        const listItem = document.createElement('li');
        listItem.textContent = query;
        listItem.addEventListener('click', () => {
            document.getElementById('query').value = query;
            fetchStockData();  
        });
        historyList.appendChild(listItem);
    });
}

// Initially display the history if any
displayHistory();
