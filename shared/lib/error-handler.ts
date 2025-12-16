/**
 * Error Handler Utility
 * Menghandle berbagai jenis error dan mengembalikan pesan yang user-friendly
 */

export interface ErrorInfo {
  title: string;
  message: string;
  type: 'network' | 'server' | 'validation' | 'auth' | 'unknown';
  isRetryable: boolean;
}

/**
 * Deteksi apakah error adalah network/connection error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('fetch failed') ||
      message.includes('network request failed') ||
      message.includes('failed to fetch') ||
      message.includes('network error') ||
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('etimedout')
    );
  }
  return false;
}

/**
 * Deteksi apakah error adalah timeout
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('timed out');
  }
  return false;
}

/**
 * Parse error menjadi informasi yang user-friendly
 */
export function parseError(error: unknown, context?: string): ErrorInfo {
  // Network/Connection Error (Server Down/Maintenance)
  if (isNetworkError(error)) {
    return {
      title: 'Server Tidak Dapat Dijangkau',
      message: 'Server sedang dalam perbaikan atau maintenance. Silakan coba lagi nanti atau hubungi administrator.',
      type: 'network',
      isRetryable: true,
    };
  }

  // Timeout Error
  if (isTimeoutError(error)) {
    return {
      title: 'Koneksi Timeout',
      message: 'Server membutuhkan waktu terlalu lama untuk merespons. Silakan periksa koneksi internet Anda dan coba lagi.',
      type: 'network',
      isRetryable: true,
    };
  }

  // HTTP Error dengan status code
  if (error instanceof Response) {
    return parseHttpError(error, context);
  }

  // Error dengan pesan custom
  if (error instanceof Error) {
    return {
      title: 'Terjadi Kesalahan',
      message: error.message || 'Terjadi kesalahan yang tidak terduga.',
      type: 'unknown',
      isRetryable: false,
    };
  }

  // Default error
  return {
    title: 'Terjadi Kesalahan',
    message: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
    type: 'unknown',
    isRetryable: false,
  };
}

/**
 * Parse HTTP error berdasarkan status code
 */
function parseHttpError(response: Response, context?: string): ErrorInfo {
  const status = response.status;

  // 400 Bad Request
  if (status === 400) {
    return {
      title: 'Permintaan Tidak Valid',
      message: 'Data yang dikirim tidak valid. Silakan periksa kembali input Anda.',
      type: 'validation',
      isRetryable: false,
    };
  }

  // 401 Unauthorized
  if (status === 401) {
    return {
      title: 'Autentikasi Gagal',
      message: context === 'login' 
        ? 'Invalid Credentials'
        : 'Sesi Anda telah berakhir. Silakan login kembali.',
      type: 'auth',
      isRetryable: false,
    };
  }

  // 403 Forbidden
  if (status === 403) {
    return {
      title: 'Akses Ditolak',
      message: 'Anda tidak memiliki izin untuk mengakses resource ini.',
      type: 'auth',
      isRetryable: false,
    };
  }

  // 404 Not Found
  if (status === 404) {
    return {
      title: 'Tidak Ditemukan',
      message: 'Resource yang Anda cari tidak ditemukan.',
      type: 'server',
      isRetryable: false,
    };
  }

  // 500 Internal Server Error
  if (status >= 500 && status < 600) {
    return {
      title: 'Server Error',
      message: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi atau hubungi administrator.',
      type: 'server',
      isRetryable: true,
    };
  }

  // Other errors
  return {
    title: 'Terjadi Kesalahan',
    message: `Terjadi kesalahan (${status}). Silakan coba lagi.`,
    type: 'unknown',
    isRetryable: true,
  };
}

/**
 * Format error message untuk ditampilkan ke user
 */
export function formatErrorMessage(error: unknown, context?: string): string {
  const errorInfo = parseError(error, context);
  return errorInfo.message;
}

/**
 * Check apakah error dapat di-retry
 */
export function isRetryableError(error: unknown): boolean {
  const errorInfo = parseError(error);
  return errorInfo.isRetryable;
}
