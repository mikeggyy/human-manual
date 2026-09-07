import { useQuiz } from '../state/useQuiz'

export function StorageNotice() {
  const { storageMessage } = useQuiz()
  return storageMessage ? <p className="storage-notice" role="status">{storageMessage}</p> : null
}
