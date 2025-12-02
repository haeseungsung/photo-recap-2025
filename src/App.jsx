import { useState } from 'react'
import IntroPage from './components/IntroPage'
import UploadPage from './components/UploadPage'
import AnalysisLoadingPage from './components/AnalysisLoadingPage'
import ResultPage from './components/ResultPage'
import './styles/App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('intro') // 'intro', 'upload', 'analyzing', 'result'
  const [selectedFiles, setSelectedFiles] = useState([])
  const [analysisResult, setAnalysisResult] = useState(null)

  // IntroPage에서 UploadPage로 이동
  const handleIntroStart = () => {
    setCurrentPage('upload')
  }

  // 분석 시작
  const handleStartAnalysis = (files) => {
    setSelectedFiles(files)
    setCurrentPage('analyzing')
  }

  // 분석 완료
  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result)
    setCurrentPage('result')
  }

  return (
    <div className="App">
      {currentPage === 'intro' && (
        <IntroPage onStart={handleIntroStart} />
      )}

      {currentPage === 'upload' && (
        <UploadPage onStartAnalysis={handleStartAnalysis} />
      )}

      {currentPage === 'analyzing' && (
        <AnalysisLoadingPage
          selectedFiles={selectedFiles}
          onAnalysisComplete={handleAnalysisComplete}
        />
      )}

      {currentPage === 'result' && (
        <ResultPage analysisResult={analysisResult} />
      )}
    </div>
  )
}

export default App
