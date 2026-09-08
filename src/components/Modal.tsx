import { useEffect, useRef, type ReactNode } from "react";
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-label={title}
    >
      <div className="modal-head">
        <div>
          <span className="eyebrow">DOCUMENT PREVIEW</span>
          <h2>{title}</h2>
        </div>
        <button aria-label="关闭预览" onClick={onClose}>
          关闭
        </button>
      </div>
      {children}
    </dialog>
  );
}
