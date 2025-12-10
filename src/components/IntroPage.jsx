import { useState, useEffect } from 'react'
import '../styles/IntroPage.css'

function IntroPage({ onStart }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [typedText, setTypedText] = useState(['', '', ''])
  const [stickerNumbers, setStickerNumbers] = useState({
    2: 1,
    '2_second': 1,
    0: 1,
    5: 1
  })
  const fullText = ['당신의', '2025', '컬러는?']

  // Random sticker selection on mount
  useEffect(() => {
    const number2Count = 6 // number2-1 to number2-6
    const number0Count = 4 // number0-1 to number0-4
    const number5Count = 4 // number5-1 to number5-4

    const first2 = Math.floor(Math.random() * number2Count) + 1
    let second2 = Math.floor(Math.random() * number2Count) + 1

    // Ensure second 2 is different from first 2
    while (second2 === first2) {
      second2 = Math.floor(Math.random() * number2Count) + 1
    }

    setStickerNumbers({
      2: first2,
      '2_second': second2,
      0: Math.floor(Math.random() * number0Count) + 1,
      5: Math.floor(Math.random() * number5Count) + 1
    })
  }, [])

  // Typing animation effect
  useEffect(() => {
    let currentLine = 0
    let currentChar = 0
    let timeoutId

    const typeNextChar = () => {
      if (currentLine >= fullText.length) return

      const line = fullText[currentLine]

      if (currentChar < line.length) {
        setTypedText(prev => {
          const newText = [...prev]
          newText[currentLine] = line.substring(0, currentChar + 1)
          return newText
        })
        currentChar++
        timeoutId = setTimeout(typeNextChar, 100)
      } else {
        // Move to next line
        currentLine++
        currentChar = 0
        if (currentLine < fullText.length) {
          timeoutId = setTimeout(typeNextChar, 200)
        }
      }
    }

    timeoutId = setTimeout(typeNextChar, 500)

    return () => clearTimeout(timeoutId)
  }, [])

  const handleStart = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onStart()
    }, 600)
  }

  return (
    <div className={`intro-page-typo ${isAnimating ? 'fade-out' : ''}`}>
      <div className="typo-container">
        <h1 className="typo-main">
          <span className="typo-line">{typedText[0]}<span className="cursor">{typedText[0].length < fullText[0].length ? '|' : ''}</span></span>
          <span className="typo-line typo-line-right sticker-line">
            {typedText[1] && (
              <span className="sticker-year">
                <img src={`/images/number2-${stickerNumbers[2]}.png`} alt="2" className="sticker-digit" />
                <img src={`/images/number0-${stickerNumbers[0]}.png`} alt="0" className="sticker-digit" />
                <img src={`/images/number2-${stickerNumbers['2_second']}.png`} alt="2" className="sticker-digit" />
                <img src={`/images/number5-${stickerNumbers[5]}.png`} alt="5" className="sticker-digit" />
              </span>
            )}
            <span className="cursor">{typedText[1].length < fullText[1].length ? '|' : ''}</span>
          </span>
          <span className="typo-line">{typedText[2]}<span className="cursor">{typedText[2].length < fullText[2].length ? '|' : ''}</span></span>
        </h1>
        <p className="typo-subtitle">Find out your 2025 color palette</p>
      </div>

      <button className="typo-cta" onClick={handleStart}>
        시작하기
      </button>
    </div>
  )
}

export default IntroPage
