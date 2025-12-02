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
  const [autoOpenUpload, setAutoOpenUpload] = useState(false)

  // IntroPage에서 파일 선택 완료
  const handleIntroStart = (files) => {
    if (files && files.length > 0) {
      setSelectedFiles(files)
      setCurrentPage('analyzing')
    } else {
      // 파일이 없으면 업로드 페이지로
      setAutoOpenUpload(true)
      setCurrentPage('upload')
    }
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
        <UploadPage onStartAnalysis={handleStartAnalysis} autoOpen={autoOpenUpload} />
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
