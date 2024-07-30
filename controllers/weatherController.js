exports.weatherController = {
    async fetchWeatherData(req, res) {
        const apiKey = process.env.API_KEY;
        const city = process.env.CITY;
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        const lat = process.env.LAT;
        const lon = process.env.LON;
        const uvApiUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        try {
            const weatherResponse = await fetch(weatherApiUrl);
            if (!weatherResponse.ok) {
                throw new Error(`HTTP error! status: ${weatherResponse.status}`);
            }
            const weatherData = await weatherResponse.json();
            const hourlyData = weatherData.list.slice(0, 24);

            const uvResponse = await fetch(uvApiUrl);
            if (!uvResponse.ok) {
                throw new Error(`HTTP error! status: ${uvResponse.status}`);
            }
            const uvData = await uvResponse.json();

            res.json({
                success: true,
                data: {
                    hours: hourlyData.map(entry => new Date(entry.dt * 1000).getHours()),
                    temperature: hourlyData.map(entry => entry.main.temp),
                    humidity: hourlyData.map(entry => entry.main.humidity),
                    uvIndex: Array(24).fill(uvData.value),
                }
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch weather data' });
        }
    }
};
