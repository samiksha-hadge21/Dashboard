const apiKey = '67e6f24ad980b3.01408533'; 

// Fetch the search history from localStorage if available
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

document.getElementById('fetchData').addEventListener('click', fetchStockData);

function fetchStockData() {
    const query = document.getElementById('query').value.toLowerCase();
    let symbol;

    // Logic to determine the stock symbol from the query
    if (query.includes('amazon') || query.includes('amzn')) {
        symbol = 'AMZN';
    } else if (query.includes('apple') || query.includes('aapl')) {
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

    // Store the query in search history
    if (!searchHistory.includes(query)) {
        searchHistory.push(query);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

    // Fetch stock data
    const url = `https://eodhistoricaldata.com/api/eod/${symbol}.US?api_token=${apiKey}&period=d`;

    fetch(url)
        .then(response => response.text())  // Use .text() to get CSV format
        .then(csvData => {
            // Parse CSV data using PapaParse
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

    // Display the updated history
    displayHistory();
}

// Display chart using Chart.js
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

// Display history list
function displayHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';  // Clear the list

    searchHistory.forEach(query => {
        const listItem = document.createElement('li');
        listItem.textContent = query;
        listItem.addEventListener('click', () => {
            document.getElementById('query').value = query;
            fetchStockData();  // Fetch data for the clicked history item
        });
        historyList.appendChild(listItem);
    });
}

// Initially display the history if any
displayHistory();
