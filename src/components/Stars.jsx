import { useEffect } from 'react'

export default function Stars() {
  useEffect(() => {
    const canvas = document.getElementById('stars-canvas')
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    let raf

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      speed: Math.random() * 0.007 + 0.002,
      offset: Math.random() * Math.PI * 2,
    }))

    const gold = Array.from({ length: 18 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.0 + 0.4,
      speed: Math.random() * 0.005 + 0.002,
      offset: Math.random() * Math.PI * 2,
    }))

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t += 0.01
      stars.forEach(s => {
        const a = 0.2 + 0.8 * Math.abs(Math.sin(t * s.speed * 60 + s.offset))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.fill()
      })
      gold.forEach(s => {
        const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.speed * 60 + s.offset))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245,192,0,${a})`
        ctx.shadowColor = 'rgba(245,192,0,0.8)'
        ctx.shadowBlur = 5
        ctx.fill()
        ctx.shadowBlur = 0
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <>
      <canvas id="stars-canvas" />
      <div className="nebula" />
    </>
  )
}
