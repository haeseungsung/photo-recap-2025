import { useState, useRef } from 'react'
import '../styles/UploadPage.css'

const MIN_IMAGES = 20
const MAX_IMAGES = 30
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']

function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef(null)

  // 파일 포맷 검증 함수 (1.5)
  const validateFileFormat = (file) => {
    // HEIC/HEIF는 브라우저에서 image/heic, image/heif로 인식되지 않을 수 있으므로
    // 파일 확장자도 함께 체크
    const fileExtension = file.name.split('.').pop().toLowerCase()
    const isValidType = ALLOWED_FORMATS.includes(file.type)
    const isValidExtension = ['jpg', 'jpeg', 'png', 'heic', 'heif'].includes(fileExtension)

    return isValidType || isValidExtension
  }

  // 파일 선택 핸들러
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)

    // 파일 포맷 검증 (1.5)
    const invalidFiles = files.filter(file => !validateFileFormat(file))
    if (invalidFiles.length > 0) {
      setErrorMessage(`지원하지 않는 파일 형식입니다. JPG, PNG, HEIC, HEIF 파일만 업로드 가능합니다.`)
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

    // 메시지 표시 로직
    if (finalFiles.length < MIN_IMAGES) {
      // 20장 미만 경고 (1.3)
      setErrorMessage(`${MIN_IMAGES}장 미만은 정확한 분석이 어려워요. 최소 ${MIN_IMAGES}장을 업로드해주세요.`)
    } else if (finalFiles.length === MAX_IMAGES) {
      // 30장 정확히 선택 완료
      setErrorMessage(`완료! ${MAX_IMAGES}장이 선택되었습니다. 이제 분석을 시작할 수 있어요.`)
    } else {
      // 20-29장 범위
      setErrorMessage('')
    }
  }

  // 개별 이미지 삭제
  const handleRemoveImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)

    // 삭제된 미리보기 URL 해제
    URL.revokeObjectURL(previewUrls[index])

    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviews)

    // 20장 미만 경고 (1.3)
    if (newFiles.length < MIN_IMAGES && newFiles.length > 0) {
      setErrorMessage(`${MIN_IMAGES}장 미만은 정확한 분석이 어려워요. 최소 ${MIN_IMAGES}장을 업로드해주세요.`)
    } else {
      setErrorMessage('')
    }
  }

  // 업로드 버튼 클릭 핸들러
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // 분석 시작 버튼 핸들러
  const handleAnalyze = () => {
    if (selectedFiles.length >= MIN_IMAGES && selectedFiles.length <= MAX_IMAGES) {
      // TODO: 다음 단계 (분석 페이지로 이동)
      console.log('분석 시작:', selectedFiles.length, '장')
    }
  }

  // 분석 버튼 disabled 조건
  const isAnalyzeDisabled = selectedFiles.length < MIN_IMAGES

  return (
    <div className="upload-page">
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
        <button
          className="upload-button"
          onClick={handleUploadClick}
        >
          {selectedFiles.length === 0 ? '사진 선택하기' : '사진 추가하기'}
        </button>

        <div className="upload-count">
          {selectedFiles.length}/{MAX_IMAGES}장 선택됨
        </div>
      </div>

      {/* 메시지 표시 (1.3) */}
      {errorMessage && (
        <div className={`message ${
          selectedFiles.length >= MIN_IMAGES && selectedFiles.length <= MAX_IMAGES
            ? 'message-success'
            : selectedFiles.length < MIN_IMAGES
              ? 'message-warning'
              : 'message-error'
        }`}>
          {errorMessage}
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
  )
}

export default UploadPage
