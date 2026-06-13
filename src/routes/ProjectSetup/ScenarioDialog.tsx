import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Pill } from '@/components/Pill/Pill';
import styles from './ScenarioDialog.module.css';

interface ScenarioDialogProps {
  open: boolean;
  /** Pre-fill the project name (empty for a brand-new project). */
  initialName: string;
  onClose: () => void;
  onContinue: (name: string, scenario: string) => void;
}

const PLACEHOLDER = '.txt 시나리오를 업로드하세요';

/**
 * Wraps the native <dialog> element. Imperatively calls showModal()/close()
 * in response to the `open` prop and resyncs its form state on each open.
 */
export function ScenarioDialog({
  open,
  initialName,
  onClose,
  onContinue,
}: ScenarioDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initialName);
  const [scenario, setScenario] = useState('');
  const [preview, setPreview] = useState(PLACEHOLDER);

  // Open/close the native dialog and reset form state when (re)opened.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setName(initialName);
      setScenario('');
      setPreview(PLACEHOLDER);
      // Uncontrolled file input — clear the previously picked file by hand.
      if (fileRef.current) fileRef.current.value = '';
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialName]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setScenario(text);
    setPreview(text || PLACEHOLDER);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onContinue(name, scenario);
  };

  // A project can be created from a name alone (it falls back to the built-in
  // scenario) or from an uploaded scenario file.
  const canContinue = name.trim().length > 0 || scenario.length > 0;

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <header className={styles.head}>
          <div>
            <span className={styles.eyebrow}>프로젝트</span>
            <h2>{initialName || '새 프로젝트'}</h2>
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>프로젝트명</span>
          <input
            type="text"
            placeholder="예시: Orbital Witness"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>시나리오 파일</span>
          <span className={styles.fileControl}>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,text/plain"
              onChange={handleFile}
            />
            <span className={styles.fileControlLabel}>
              시나리오 텍스트 파일을 고르세요
            </span>
            <span className={styles.fileControlHint}>
              선택 사항 · 비우면 내장 시나리오 사용
            </span>
          </span>
        </div>

        <div className={styles.previewCard}>
          <span className={styles.previewLabel}>시나리오 프리뷰</span>
          <pre className={styles.preview}>{preview}</pre>
        </div>

        <div className={styles.actions}>
          <Pill variant="primary" type="submit" disabled={!canContinue}>
            스토리보드로 계속 <span aria-hidden="true">→</span>
          </Pill>
        </div>
      </form>
    </dialog>
  );
}
