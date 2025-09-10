"use client"
import { useEffect } from "react"

export default function MouseSprinkles() {
    useEffect(() => {
        const handleMouseMove = (e) => {
            const sprinkle = document.createElement("div")
            sprinkle.className = "sprinkle"

            const hue = Math.floor(Math.random() * 360)
            sprinkle.style.background = "hsl(" + hue + ", 100%, 70%)"
            sprinkle.style.left = e.pageX + "px"
            sprinkle.style.top = e.pageY + "px"

            document.body.appendChild(sprinkle)

            requestAnimationFrame(() => {
                sprinkle.style.transform =
                    "translate(" + (Math.random() * 30 - 15) + "px," + (Math.random() * 30 - 15) + "px)"
                sprinkle.style.opacity = "0"
            })

            setTimeout(() => {
                sprinkle.remove()
            }, 800)
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, []);

    return null
}