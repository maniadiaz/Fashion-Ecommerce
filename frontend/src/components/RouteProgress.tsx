import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false, speed: 300, minimum: 0.15 })

// Inject custom styles so the bar matches the brand color
const style = document.createElement('style')
style.textContent = `
  #nprogress .bar {
    background: #0A0A0A !important;
    height: 2px !important;
  }
  #nprogress .peg {
    box-shadow: 0 0 8px #0A0A0A, 0 0 4px #0A0A0A !important;
  }
`
document.head.appendChild(style)

export default function RouteProgress() {
  const location = useLocation()

  useEffect(() => {
    NProgress.start()
    const timer = setTimeout(() => NProgress.done(), 400)
    return () => {
      clearTimeout(timer)
      NProgress.done()
    }
  }, [location.pathname, location.search])

  return null
}
