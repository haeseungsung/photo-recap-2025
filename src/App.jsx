import { useState } from 'react'
import UploadPage from './components/UploadPage'
import AnalysisLoadingPage from './components/AnalysisLoadingPage'
import ResultPage from './components/ResultPage'
import './styles/App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('upload') // 'upload', 'analyzing', 'result'
  const [selectedFiles, setSelectedFiles] = useState([])
  const [analysisResult, setAnalysisResult] = useState(null)

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
