/**
 * 파일 검증 유틸리티
 * 2025 Recap 프로젝트 - 업로드 파일 검증 로직
 */

// 상수 정의
export const MIN_IMAGES = 20
export const MAX_IMAGES = 50
export const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif']
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif']

// 검증 결과 타입
export type ValidationResult = {
  isValid: boolean
  errorType?: 'FORMAT_ERROR' | 'MIN_COUNT_WARNING' | 'MAX_COUNT_EXCEEDED' | 'NONE'
  message: string
  messageType?: 'error' | 'warning' | 'success' | 'info'
}

/**
 * 개별 파일 포맷 검증
 * HEIC/HEIF는 브라우저에서 MIME type으로 인식되지 않을 수 있으므로 확장자도 체크
 */
export const validateFileFormat = (file: File): boolean => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
  const isValidType = ALLOWED_FORMATS.includes(file.type)
  const isValidExtension = ALLOWED_EXTENSIONS.includes(fileExtension)

  return isValidType || isValidExtension
}

/**
 * 파일 배열의 포맷 검증
 * 잘못된 포맷이 하나라도 있으면 false 반환
 */
export const validateFilesFormat = (files: File[]): ValidationResult => {
  const invalidFiles = files.filter(file => !validateFileFormat(file))

  if (invalidFiles.length > 0) {
    return {
      isValid: false,
      errorType: 'FORMAT_ERROR',
      message: `지원하지 않는 파일 형식입니다. JPG, PNG, HEIC, HEIF 파일만 업로드 가능합니다.`,
      messageType: 'error'
    }
  }

  return {
    isValid: true,
    errorType: 'NONE',
    message: '',
    messageType: 'info'
  }
}

/**
 * 파일 개수 검증
 * 20장 미만: 경고 (업로드는 가능하지만 분석 정확도 저하 안내)
 * 30장 초과: 에러 (최대 30장까지만 허용)
 */
export const validateFileCount = (fileCount: number): ValidationResult => {
  // 30장 초과
  if (fileCount > MAX_IMAGES) {
    return {
      isValid: false,
      errorType: 'MAX_COUNT_EXCEEDED',
      message: `최대 ${MAX_IMAGES}장까지만 선택 가능합니다.\n처음 ${MAX_IMAGES}장만 선택되었습니다.`,
      messageType: 'error'
    }
  }

  // 정확히 30장 선택
  if (fileCount === MAX_IMAGES) {
    return {
      isValid: true,
      errorType: 'NONE',
      message: `완료! ${MAX_IMAGES}장이 선택되었습니다. 이제 분석을 시작할 수 있어요.`,
      messageType: 'success'
    }
  }

  // 20장 미만 (경고)
  if (fileCount > 0 && fileCount < MIN_IMAGES) {
    return {
      isValid: true,
      errorType: 'MIN_COUNT_WARNING',
      message: `${MIN_IMAGES}장 미만은 정확한 분석이 어려워요. 최소 ${MIN_IMAGES}장을 업로드해주세요.`,
      messageType: 'warning'
    }
  }

  // 20-29장 (정상 범위)
  if (fileCount >= MIN_IMAGES && fileCount < MAX_IMAGES) {
    return {
      isValid: true,
      errorType: 'NONE',
      message: '',
      messageType: 'info'
    }
  }

  // 0장 (초기 상태)
  return {
    isValid: true,
    errorType: 'NONE',
    message: '',
    messageType: 'info'
  }
}

/**
 * 종합 파일 검증
 * 포맷과 개수를 모두 체크
 */
export const validateFiles = (files: File[], existingFileCount: number = 0): ValidationResult => {
  // 1. 포맷 검증
  const formatResult = validateFilesFormat(files)
  if (!formatResult.isValid) {
    return formatResult
  }

  // 2. 개수 검증 (기존 파일 + 새로 추가할 파일)
  const totalCount = existingFileCount + files.length
  return validateFileCount(totalCount)
}

/**
 * 분석 버튼 활성화 여부 확인
 */
export const canAnalyze = (fileCount: number): boolean => {
  return fileCount >= MIN_IMAGES && fileCount <= MAX_IMAGES
}
