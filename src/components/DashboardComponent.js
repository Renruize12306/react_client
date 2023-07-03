import React, {Component} from 'react';
import Chart from './CandleStickChartForDiscontinuousIntraDay';

class DashboardComponent extends Component {
    

    constructor() {
        super();
        this.state = {  
            symbols: []
        };

        this.mountedSubscriptions = {};
        this.buffer = {};
    }

    componentDidMount = async() => {

        var symbolKeys = await this.loadDashboard();
        //var symbolKeys = ["a"]
        if (symbolKeys.length > 0) {
            for (var i in symbolKeys) {
                var symbolKey = symbolKeys[i];

                    // Create a WebSocket connection
                    //const socket = new WebSocket('ws://127.0.0.1:8000/wss_api');
                    //const socket = new WebSocket('ws://127.0.0.1:8081');
                    const socket = new WebSocket('ws://3.83.64.161:8081');
                    // Event listener for WebSocket connection open
                    socket.addEventListener('open', () => {
                    console.log('WebSocket connection established.');
                    //socket.send('start_capture send to server');
                    });

                    // Event listener for WebSocket messages
                    socket.addEventListener('message', event => {

                    const payload = event.data;
                    console.log('Got this payload: ' + payload);
                    this.handleSubscription(payload)
                    });
                    

                    // Event listener for WebSocket connection close
                    socket.addEventListener('close', () => {
                    console.log('WebSocket connection closed.');
                    });



            }
        }
    }

    handleSubscription(data) {
        //var data = "[{\"ev\":\"XA\",\"pair\":\"BTC-USD\",\"v\":2.38198008,\"vw\":30529.5273,\"z\":0,\"o\":30533.39,\"c\":30524.65,\"h\":30565,\"l\":30523,\"s\":1688319480000,\"e\":1688319540000}]"
        var row = JSON.parse(data);
        var symbol = row.ev_pair;

        var point = {
            date: new Date(+((row.s+row.s)/2)),
            open: +row.o,
            high: +row.h,
            low: +row.l,
            close: +row.c,
            volume: +row.v
        };

        var isAddedToBuffer = false;
        var dataPoints = this.state.dataPoints;
        
        if (dataPoints[symbol].points.length == 0 && this.buffer[symbol].length == 0) {
            this.buffer[symbol].push(point);
            isAddedToBuffer = true;
        } else if (this.buffer[symbol] != null && this.buffer[symbol].length > 0) {
            dataPoints[symbol].points = dataPoints[symbol].points.concat(this.buffer[symbol]);
            this.buffer[symbol] = [];
        }

        if (!isAddedToBuffer) {
            dataPoints[symbol].points.push(point);
            this.setState({dataPoints: dataPoints});
        }
    }

    componentWillUnmount = async() => {
        for (var symbolKey in this.mountedSubscriptions) {
            console.log("Unsubscribing "+symbolKey);
            this.mountedSubscriptions[symbolKey].unsubscribe();
            this.mountedSubscriptions[symbolKey] = null;
        }
    }

    loadDashboard = async() => {

        var symbols = ["XA_BTC-USD"]
        var dataPointsBySymbol = {};
        for (var i in symbols) {
            var symbol = symbols[i];

            dataPointsBySymbol[symbol] = await this.retrieveLatestPricesBySymbol(symbol);
        }

        var symbolKeys = Object.keys(dataPointsBySymbol);

        this.setState({
            dataPoints: dataPointsBySymbol,
            symbols: symbolKeys
        });

        return symbolKeys;
    }

    retrieveLatestPricesBySymbol = async(symbol) => {
        var dataPoints = [];

        {  
            //var url = 'http://127.0.0.1:8000/crypto_aggregates/get_all_by_en_pair?ev_pair='
            var url = 'http://3.83.64.161:8000/crypto_aggregates/get_all_by_en_pair?ev_pair='
            var response = await fetch( url + symbol,{ mode: 'cors'}
            );
            const data = await response.json();
            var items = data.crypto_aggregates;

            if (items.length > 0) {
                for (var i = 0;i < items.length;i++) {
                    var item = items[i];
                    var point = {
                        date: new Date(+((item.s+item.s)/2)),
                        open: +item.o,
                        high: +item.h,
                        low: +item.l,
                        close: +item.c,
                        volume: +item.v
                    };
                    dataPoints.push(point);
                }
            }
            
        } 

        return {
            //points: dataPoints.reverse()
            points: dataPoints
        };
    }

    render() {
        return (
            <div>
                <h3>Dashboard</h3>
                {/* <a href="/manage-stock-symbols">Manage Stock Symbols</a> */}
                <div>
                    {this.state.symbols.map(symbol => {
                        var hasDataPoints = this.state.dataPoints[symbol].points.length > 0;
                        return (
                            <div className="m-2">
                                <h3>{symbol}</h3>
                                <div className="border">
                                    {hasDataPoints ? (
                                        <Chart symbol={symbol} data={this.state.dataPoints[symbol].points} />
                                    ) : (
                                        <div className="p-2"><h5 className="text-danger">No data points</h5></div>
                                    )}
                                    
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        ); 
    }
}

export default DashboardComponent;