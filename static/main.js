// Initial chart setup
const chartOptions1 = {
    layout: {
        background: { type: 'solid', color: 'white' }, // 배경 설정
        textColor: 'black', // 텍스트 색상 설정
    },
    grid: {
        vertLines: {
            color: '#e1e1e1', // 수직 선 색상 설정
        },
        horzLines: {
            color: '#e1e1e1', // 수평 선 색상 설정
        },
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal, // 크로스헤어 모드 설정
    },
    timeScale: {
        visible: false, // 시간 스케일 가시성 설정
    },
    width: document.getElementById('chart').clientWidth, // 차트 너비 설정
    height: document.getElementById('chart').clientHeight, // 차트 높이 설정
};

// 두 번째 차트 옵션 설정
const chartOptions2 = {
    layout: {
        background: { type: 'solid', color: 'white' }, // 배경 설정
        textColor: 'black', // 텍스트 색상 설정
    },
    grid: {
        vertLines: {
            color: '#e1e1e1', // 수직 선 색상 설정
        },
        horzLines: {
            color: '#e1e1e1', // 수평 선 색상 설정
        },
    },
    timeScale: {
        visible: true, // 시간 스케일 가시성 설정
    },
    width: document.getElementById('chart').clientWidth, // 차트 너비 설정
    height: document.getElementById('rsiChart').clientHeight, // 차트 높이 설정
};

// 첫 번째 차트 생성 및 설정
const chart = LightweightCharts.createChart(document.getElementById('chart'), chartOptions1);
const candlestickSeries = chart.addCandlestickSeries();
const emaLine = chart.addLineSeries({
    color: 'blue', // EMA 선의 색상 설정
    lineWidth: 2 // EMA 선의 두께 설정
});

// 두 번째 차트 생성 및 설정
const rsiChart = LightweightCharts.createChart(document.getElementById('rsiChart'), chartOptions2);
const rsiLine = rsiChart.addLineSeries({
    color: 'red', // RSI 선의 색상 설정
    lineWidth: 2 // RSI 선의 두께 설정
});

let autoUpdateInterval; // 자동 업데이트 간격 변수


// 데이터를 가져오는 함수
function fetchData(ticker, timeframe, emaPeriod, rsiPeriod) {
    // API를 통해 데이터 가져오기
    fetch(`/api/data/${ticker}/${timeframe}/${emaPeriod}/${rsiPeriod}`)
        .then(response => response.json()) // 응답을 JSON 형식으로 변환
        .then(data => {
            // 가져온 데이터를 각 시리즈에 설정
            candlestickSeries.setData(data.candlestick); // 캔들스틱 시리즈 데이터 설정
            emaLine.setData(data.ema); // EMA 라인 시리즈 데이터 설정
            rsiLine.setData(data.rsi); // RSI 라인 시리즈 데이터 설정
        })
        .catch(error => {
            // 데이터 가져오기 실패 시 에러 처리
            console.error('Error fetching data:', error);
        });
}

// 페이지 로드 시 NVDA 데이터를 기본 설정값으로 가져오기 (기간: 일일, EMA 기간: 20, RSI 기간: 14)
window.addEventListener('load', () => {
    fetchData('NVDA', '1d', 20, 14); // NVDA 데이터 가져오기
    loadWatchlist(); // 관심 종목 목록 로드
});

// 버튼 클릭 시 데이터 가져오기 처리
document.getElementById('fetchData').addEventListener('click', () => {
    // 입력된 값 가져오기
    const ticker = document.getElementById('ticker').value; // 종목 심볼
    const timeframe = document.getElementById('timeframe').value; // 시간 프레임
    const emaPeriod = document.getElementById('emaPeriod').value; // EMA 기간
    const rsiPeriod = document.getElementById('rsiPeriod').value; // RSI 기간
    // 입력된 값으로 데이터 가져오기 함수 호출
    fetchData(ticker, timeframe, emaPeriod, rsiPeriod);
});

// 자동 업데이트 기능을 처리하는 함수
document.getElementById('autoUpdate').addEventListener('change', (event) => { // 'autoUpdate' 요소에 변경 이벤트 리스너 추가
    if (event.target.checked) { // 체크박스가 선택된 경우
        const frequency = document.getElementById('updateFrequency').value * 1000; // 주기를 초 단위로 변환하여 frequency에 저장
        autoUpdateInterval = setInterval(() => { // 주기마다 반복 실행되는 setInterval 함수 호출
            const ticker = document.getElementById('ticker').value; // ticker 값 가져오기
            const timeframe = document.getElementById('timeframe').value; // timeframe 값 가져오기
            const emaPeriod = document.getElementById('emaPeriod').value; // emaPeriod 값 가져오기
            const rsiPeriod = document.getElementById('rsiPeriod').value; // rsiPeriod 값 가져오기
            fetchData(ticker, timeframe, emaPeriod, rsiPeriod); // fetchData 함수 호출하여 데이터 가져오기
        }, frequency); // frequency 주기로 설정하여 실행
    } else { // 체크박스가 선택되지 않은 경우
        clearInterval(autoUpdateInterval); // autoUpdateInterval을 clearInterval하여 자동 업데이트 중지
    }
});

// 창 크기 변경 이벤트 처리
window.addEventListener('resize', () => {
    // 차트의 크기를 창 크기에 맞게 조정
    chart.resize(document.getElementById('chart').clientWidth, document.getElementById('chart').clientHeight);
    rsiChart.resize(document.getElementById('rsiChart').clientWidth, document.getElementById('rsiChart').clientHeight);
});

// 테마 전환 기능
document.getElementById('themeToggle').addEventListener('click', () => {
    // 문서의 클래스 목록과 관련 요소들을 가져옴
    const bodyClassList = document.body.classList; // body 요소의 클래스 목록
    const watchlist = document.getElementById('watchlist'); // watchlist 요소
    const inputs = document.querySelectorAll('input, select'); // 모든 input 및 select 요소
    
    // 현재 테마 확인
    if (bodyClassList.contains('bg-white')) { // 흰색 테마인 경우
        // 클래스 변경하여 다크 테마로 변경
        bodyClassList.replace('bg-white', 'bg-gray-900'); // body 배경색 변경
        bodyClassList.replace('text-black', 'text-white'); // body 텍스트 색상 변경
        watchlist.classList.replace('bg-gray-100', 'bg-gray-800'); // watchlist 배경색 변경
        watchlist.classList.replace('text-black', 'text-white'); // watchlist 텍스트 색상 변경
        inputs.forEach(input => { // 모든 input 및 select 요소에 대해 반복
            input.classList.replace('bg-white', 'bg-gray-900'); // 배경색 변경
            input.classList.replace('text-black', 'text-white'); // 텍스트 색상 변경
        });
        // 차트 옵션을 다크 테마로 변경
        chart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'black' }, // 배경색 변경
                textColor: 'white', // 텍스트 색상 변경
            },
            grid: {
                vertLines: { color: 'black',}, // 수직 선 색상 변경
                horzLines: { color: 'black',}, // 수평 선 색상 변경
            }
        });
        rsiChart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'black' }, // 배경색 변경
                textColor: 'white', // 텍스트 색상 변경
            },
            grid: {
                vertLines: { color: 'black', }, // 수직 선 색상 변경
                horzLines: { color: 'black', }, // 수평 선 색상 변경
            }
        });
    } else { // 다크 테마인 경우
        // 클래스 변경하여 흰색 테마로 변경
        bodyClassList.replace('bg-gray-900', 'bg-white'); // body 배경색 변경
        bodyClassList.replace('text-white', 'text-black'); // body 텍스트 색상 변경
        watchlist.classList.replace('bg-gray-800', 'bg-gray-100'); // watchlist 배경색 변경
        watchlist.classList.replace('text-white', 'text-black'); // watchlist 텍스트 색상 변경
        inputs.forEach(input => { // 모든 input 및 select 요소에 대해 반복
            input.classList.replace('bg-gray-900', 'bg-white'); // 배경색 변경
            input.classList.replace('text-white', 'text-black'); // 텍스트 색상 변경
        });
        // 차트 옵션을 흰색 테마로 변경
        chart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'white' }, // 배경색 변경
                textColor: 'black', // 텍스트 색상 변경
            },
            grid: {
                vertLines: { color: '#e1e1e1', }, // 수직 선 색상 변경
                horzLines: { color: '#e1e1e1', }, // 수평 선 색상 변경
            }
        });
        rsiChart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'white' }, // 배경색 변경
                textColor: 'black', // 텍스트 색상 변경
            },
            grid: {
                vertLines: { color: '#e1e1e1', }, // 수직 선 색상 변경
                horzLines: { color: '#e1e1e1', }, // 수평 선 색상 변경
            }
        });
    }
});


// 서버에서 워치리스트 심볼을 로드하는 함수
function loadWatchlist() {
    fetch('/api/symbols') // 서버에서 심볼을 가져옴
        .then(response => response.json()) // JSON 형식으로 변환
        .then(symbols => { // 가져온 심볼에 대해 실행
            const watchlistItems = document.getElementById('watchlistItems'); // 워치리스트 아이템 요소 가져오기
            watchlistItems.innerHTML = ''; // 기존 아이템 초기화
            symbols.forEach(symbol => { // 각 심볼에 대해 반복
                const item = document.createElement('div'); // 새로운 div 요소 생성
                item.className = 'watchlist-item'; // 클래스 설정
                item.innerText = symbol; // 텍스트 설정
                item.addEventListener('click', () => { // 클릭 이벤트 리스너 추가
                    document.getElementById('ticker').value = symbol; // 티커 입력 필드에 심볼 설정
                    // 해당 심볼에 대한 데이터 가져오기
                    fetchData(symbol, document.getElementById('timeframe').value, document.getElementById('emaPeriod').value, document.getElementById('rsiPeriod').value);
                });
                watchlistItems.appendChild(item); // 아이템을 워치리스트에 추가
            });
        })
        .catch(error => { // 에러 처리
            console.error('Error loading watchlist:', error); // 에러 로깅
        });
}

// 차트 간에 가시적인 논리 범위를 동기화하는 함수
function syncVisibleLogicalRange(chart1, chart2) {
    chart1.timeScale().subscribeVisibleLogicalRangeChange(timeRange => { // chart1의 시간 축 변경 이벤트를 구독
        chart2.timeScale().setVisibleLogicalRange(timeRange); // chart2의 시간 축 범위를 동기화
    });

    chart2.timeScale().subscribeVisibleLogicalRangeChange(timeRange => { // chart2의 시간 축 변경 이벤트를 구독
        chart1.timeScale().setVisibleLogicalRange(timeRange); // chart1의 시간 축 범위를 동기화
    });
}

// 차트 간에 가시적인 논리 범위 동기화 함수 호출
syncVisibleLogicalRange(chart, rsiChart);


// 차트 간에 크로스헤어 위치를 동기화하는 함수
function getCrosshairDataPoint(series, param) {
    if (!param.time) { // 시간이 없으면
        return null; // null 반환
    }
    const dataPoint = param.seriesData.get(series); // 시리즈 데이터에서 데이터 포인트 가져오기
    return dataPoint || null; // 데이터 포인트가 있으면 반환, 없으면 null 반환
}

// 크로스헤어를 동기화하는 함수
function syncCrosshair(chart, series, dataPoint) {
    if (dataPoint) { // 데이터 포인트가 있는 경우
        chart.setCrosshairPosition(dataPoint.value, dataPoint.time, series); // 해당 시리즈와 데이터 포인트의 값을 크로스헤어 위치로 설정
        return; // 함수 종료
    }
    chart.clearCrosshairPosition(); // 데이터 포인트가 없으면 크로스헤어 위치를 지움
}

// 주어진 차트에서 크로스헤어 이동 이벤트를 구독하고, 해당 이벤트가 발생할 때 크로스헤어를 동기화함
chart.subscribeCrosshairMove(param => { // 주어진 차트에서 크로스헤어 이동 이벤트를 구독
    const dataPoint = getCrosshairDataPoint(candlestickSeries, param); // 크로스헤어가 위치한 데이터 포인트 가져오기
    syncCrosshair(rsiChart, rsiLine, dataPoint); // rsiChart와 rsiLine으로 크로스헤어 위치 동기화
});

rsiChart.subscribeCrosshairMove(param => { // rsiChart에서 크로스헤어 이동 이벤트를 구독
    const dataPoint = getCrosshairDataPoint(rsiLine, param); // 크로스헤어가 위치한 데이터 포인트 가져오기
    syncCrosshair(chart, candlestickSeries, dataPoint); // chart와 candlestickSeries로 크로스헤어 위치 동기화
});

