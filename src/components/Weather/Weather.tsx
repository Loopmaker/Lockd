import { useState, useEffect, useCallback  } from 'react'

interface WeatherData {
  temperature: number
  windspeed: number
  humidity: number
  weatherCode: number
}

function getWeatherLabel(code: number): string {
  if (code === 0) return 'Clear Sky'
  if (code <= 2) return 'Partly Cloudy'
  if (code === 3) return 'Overcast'
  if (code <= 49) return 'Foggy'
  if (code <= 59) return 'Drizzle'
  if (code <= 69) return 'Rainy'
  if (code <= 79) return 'Snowy'
  if (code <= 82) return 'Rain Showers'
  if (code <= 86) return 'Snow Showers'
  if (code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 2) return '⛅'
  if (code === 3) return '☁️'
  if (code <= 49) return '🌫️'
  if (code <= 59) return '🌦️'
  if (code <= 69) return '🌧️'
  if (code <= 79) return '❄️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '🌨️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

type Status = 'idle' | 'loading' | 'success' | 'error' | 'denied'

function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  const fetchWeather = useCallback(() => {
  setStatus('loading')
  setWeather(null)

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m&forecast_days=1`
        )
        const data = await res.json()
        setWeather({
          temperature: data.current_weather.temperature,
          windspeed: data.current_weather.windspeed,
          humidity: data.hourly.relativehumidity_2m[0],
          weatherCode: data.current_weather.weathercode,
        })
        setStatus('success')
      } catch {
        setStatus('error')
      }
    },
    () => {
      setStatus('denied')
    }
  )
}, [])

useEffect(() => {
  fetchWeather()
}, [fetchWeather])

  return (
    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto py-12">

      {/* Loading */}
      {status === 'loading' && (
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          Fetching your location...
        </p>
      )}

      {/* Denied */}
      {status === 'denied' && (
        <div className="text-center flex flex-col gap-2">
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Location access was denied.
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            Please allow location access in your browser settings and try again.
          </p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          Failed to fetch weather. Check your connection.
        </p>
      )}

      {/* Success */}
      {status === 'success' && weather && (
        <div
          className="w-full flex flex-col gap-6 p-6 rounded-xl"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Icon + Condition */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl">{getWeatherIcon(weather.weatherCode)}</span>
            <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
              {getWeatherLabel(weather.weatherCode)}
            </p>
          </div>

          {/* Temperature */}
          <p
            className="text-6xl font-bold text-center"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text)' }}
          >
            {weather.temperature}°C
          </p>

          {/* Details */}
          <div
            className="flex justify-around pt-4"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Humidity</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {weather.humidity}%
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Wind</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {weather.windspeed} km/h
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      {status !== 'loading' && (
        <button
          onClick={fetchWeather}
          className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
          style={{
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-muted)',
          }}
        >
          Refresh
        </button>
      )}

    </div>
  )
}

export default Weather