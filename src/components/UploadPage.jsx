import { useState, useRef } from 'react'
import '../styles/UploadPage.css'
import {
  MIN_IMAGES,
  MAX_IMAGES,
  validateFiles,
  validateFileCount,
  canAnalyze
} from '../utils/validateFiles'

function UploadPage({ onStartAnalysis }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [validationMessage, setValidationMessage] = useState('')
  const [validationMessageType, setValidationMessageType] = useState('info')
  const fileInputRef = useRef(null)

  // 파일 선택 핸들러
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)

    // 유틸리티 함수를 사용한 검증 (2.1)
    const validationResult = validateFiles(files, selectedFiles.length)

    // 포맷 에러인 경우 즉시 반환
    if (!validationResult.isValid && validationResult.errorType === 'FORMAT_ERROR') {
      setValidationMessage(validationResult.message)
      setValidationMessageType(validationResult.messageType)
      return
    }

    // 기존 파일과 합쳐서 총 개수 계산
    const totalFiles = [...selectedFiles, ...files]

    // 30장 초과 시 처음 30장만 선택 (1.4)
    let finalFiles = totalFiles
    if (totalFiles.length > MAX_IMAGES) {
      finalFiles = totalFiles.slice(0, MAX_IMAGES)
      alert(`최대 ${MAX_IMAGES}장까지만 선택 가능합니다.\n처음 ${MAX_IMAGES}장만 선택되었습니다.`)
    }

    // 파일 목록 업데이트
    setSelectedFiles(finalFiles)

    // 미리보기 URL 생성
    const newPreviewUrls = finalFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(newPreviewUrls)

    // 개수에 따른 메시지 표시 (2.2, 2.3, 2.4)
    const countValidation = validateFileCount(finalFiles.length)
    setValidationMessage(countValidation.message)
    setValidationMessageType(countValidation.messageType)
  }

  // 개별 이미지 삭제
  const handleRemoveImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)

    // 삭제된 미리보기 URL 해제
    URL.revokeObjectURL(previewUrls[index])

    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviews)

    // 개수에 따른 메시지 업데이트 (2.2)
    const countValidation = validateFileCount(newFiles.length)
    setValidationMessage(countValidation.message)
    setValidationMessageType(countValidation.messageType)
  }

  // 업로드 버튼 클릭 핸들러
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // 분석 시작 버튼 핸들러
  const handleAnalyze = () => {
    if (canAnalyze(selectedFiles.length)) {
      // 분석 페이지로 이동
      onStartAnalysis(selectedFiles)
    }
  }

  // 분석 버튼 disabled 조건 (2.1)
  const isAnalyzeDisabled = !canAnalyze(selectedFiles.length)

  return (
    <div className="upload-page">
      {/* Content */}
      <div className="upload-content">
        {/* 헤더 */}
        <header className="upload-header">
          <h1 className="upload-title">Upload your 2025 moments</h1>
          <p className="upload-subtitle">
            {MIN_IMAGES}~{MAX_IMAGES}장의 사진을 선택해주세요
          </p>
        </header>

      {/* 파일 업로드 Input (hidden) - 1.1 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* 업로드 버튼 영역 */}
      <div className="upload-actions">
        <div className="button-row">
          <button
            className="upload-button"
            onClick={handleUploadClick}
          >
            {selectedFiles.length === 0 ? '사진 선택하기' : '사진 추가하기'}
          </button>

          {selectedFiles.length > 0 && (
            <button
              className="analyze-button-top"
              onClick={handleAnalyze}
              disabled={isAnalyzeDisabled}
            >
              분석 시작하기
            </button>
          )}
        </div>

        <div className="upload-count">
          {selectedFiles.length}/{MAX_IMAGES}장 선택됨
        </div>
      </div>

      {/* 메시지 표시 (2.2, 2.5) */}
      {validationMessage && (
        <div className={`message message-${validationMessageType}`}>
          {validationMessage}
        </div>
      )}

      {/* 썸네일 그리드 (3열) - 1.1 */}
      {previewUrls.length > 0 && (
        <div className="thumbnail-grid">
          {previewUrls.map((url, index) => (
            <div key={index} className="thumbnail-item">
              <img src={url} alt={`Preview ${index + 1}`} className="thumbnail-image" />
              <button
                className="thumbnail-remove"
                onClick={() => handleRemoveImage(index)}
                aria-label="이미지 삭제"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

        {/* 분석 시작 버튼 */}
        {selectedFiles.length > 0 && (
          <div className="analyze-section">
            <button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={isAnalyzeDisabled}
            >
              분석 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadPage
