import { useEffect, useRef, useState } from 'react'
import { Alert, Button, Modal } from 'react-bootstrap'
import { useLanguageContext } from '../contexts/LanguageContext'

interface DetectedBarcode {
  rawValue?: string
}

interface BarcodeDetectorInstance {
  detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance
}

interface BarcodeScannerProps {
  show: boolean
  onHide: () => void
  onDetected: (barcode: string) => void
}

const getBarcodeDetector = () => {
  return (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
}

const scanIntervalMs = 250

export const BarcodeScanner = ({ show, onHide, onDetected }: BarcodeScannerProps) => {
  const { t } = useLanguageContext()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const onDetectedRef = useRef(onDetected)
  const onHideRef = useRef(onHide)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    onDetectedRef.current = onDetected
  }, [onDetected])

  useEffect(() => {
    onHideRef.current = onHide
  }, [onHide])

  useEffect(() => {
    if (!show) {
      return
    }

    const BarcodeDetector = getBarcodeDetector()

    if (!BarcodeDetector) {
      setErrorMessage(t.barcodeScannerUnsupported)
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(t.barcodeScannerUnsupported)
      return
    }

    let isCancelled = false
    let scanTimeoutId: number | undefined
    let stream: MediaStream | null = null
    const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] })

    const scheduleScan = (delay = scanIntervalMs) => {
      scanTimeoutId = window.setTimeout(() => {
        void scan()
      }, delay)
    }

    const scan = async () => {
      const videoElement = videoRef.current

      if (!videoElement || isCancelled || videoElement.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
        scheduleScan(100)
        return
      }

      try {
        const [result] = await detector.detect(videoElement)

        if (result?.rawValue) {
          onDetectedRef.current(result.rawValue)
          onHideRef.current()
          return
        }
      } catch {
        setErrorMessage(t.barcodeScannerUnsupported)
        return
      }

      scheduleScan()
    }

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
          },
        })

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        setErrorMessage(null)
        scheduleScan(0)
      } catch {
        setErrorMessage(t.barcodeScannerUnsupported)
      }
    }

    void start()

    return () => {
      isCancelled = true
      if (scanTimeoutId !== undefined) {
        window.clearTimeout(scanTimeoutId)
      }

      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [show, t.barcodeScannerUnsupported])

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t.barcodeScannerTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-secondary small">{t.barcodeScannerDescription}</p>
        {errorMessage ? <Alert variant="warning" className="mb-3">{errorMessage}</Alert> : null}
        <video ref={videoRef} className="w-100 rounded bg-dark" autoPlay muted playsInline />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>{t.closeScanner}</Button>
      </Modal.Footer>
    </Modal>
  )
}