// ============================================
// CHROME — shared UI shells (modals, panels, buttons, toast)
// ============================================

import React from 'react';
import { FONTS, UI, candy3d } from '../constants.js';
import { useFocusTrap } from '../hooks.js';

// --------------------------------------------
// IconButton — circular glass button (icon + optional caption)
// --------------------------------------------
export function IconButton({ icon, label, onClick, size = 44, ariaLabel, style }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || label}
      className="flex flex-col items-center justify-center active:scale-90"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: UI.surface.base,
        border: UI.border.subtle,
        cursor: "pointer",
        transition: "transform 0.15s, background 0.15s",
        ...style,
      }}
    >
      <span style={{ fontSize: size * (label ? 0.32 : 0.4), lineHeight: 1, color: UI.text.secondary }}>
        {icon}
      </span>
      {label && (
        <span style={{
          fontSize: UI.font.xs,
          color: UI.text.muted,
          fontFamily: FONTS.default,
          fontWeight: 700,
          marginTop: 2,
        }}>
          {label}
        </span>
      )}
    </button>
  );
}

// --------------------------------------------
// ModalCard — centered dialog card over a blurred backdrop
// --------------------------------------------
export function ModalCard({
  show, onClose, title, children,
  ariaLabel, backdropClose = true, showClose = true, zIndex = UI.z.overlay,
}) {
  const trapRef = useFocusTrap(show, onClose);
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{ zIndex, ...UI.backdrop }}
      onClick={backdropClose && onClose ? onClose : undefined}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        className="p-6 w-full max-w-sm"
        style={{
          background: UI.panel,
          border: "1.5px solid rgba(255,255,255,0.18)",
          borderRadius: UI.radius.lg,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 20px 56px rgba(0,0,0,0.55)",
          animation: "bounceIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <h3 className="font-bold text-center mb-4" style={{
            fontFamily: FONTS.orbitron,
            fontSize: UI.font.lg,
            color: UI.text.primary,
          }}>
            {title}
          </h3>
        )}

        {children}

        {showClose && onClose && (
          <button
            onClick={onClose}
            className="candy-btn w-full py-2.5 font-bold active:scale-95"
            style={{
              background: UI.candy.button.green.grad,
              color: "#fff",
              fontSize: UI.font.md,
              fontFamily: FONTS.default,
              fontWeight: 700,
              borderRadius: UI.radius.pill,
              border: "2px solid rgba(255,255,255,0.5)",
              boxShadow: candy3d(UI.candy.button.green.edge, 3),
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------
// FullScreenPanel — full-screen overlay with standard header
// --------------------------------------------
export function FullScreenPanel({ show, onClose, title, titleGradient = UI.titleGrad, children, footer }) {
  const trapRef = useFocusTrap(show, onClose);
  if (!show) return null;

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: UI.z.overlay, background: UI.panelFull, backdropFilter: "blur(12px)" }}
    >
      <div
        className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top, 12px))" }}
      >
        <h2 className="font-bold" style={{
          fontFamily: FONTS.orbitron,
          fontSize: "1.3rem",
          color: "#fff",
          textShadow: "0 3px 0 rgba(0,0,0,0.35), 0 6px 14px rgba(0,0,0,0.3)",
        }}>
          {title}
        </h2>
        <IconButton icon="✕" ariaLabel="Close" onClick={onClose} size={40} />
      </div>

      {children}
      {footer}
    </div>
  );
}

// --------------------------------------------
// Toast — transient bottom-center message
// --------------------------------------------
export function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      className="fixed left-1/2 pointer-events-none"
      style={{
        zIndex: UI.z.toast,
        bottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
        transform: "translateX(-50%)",
        background: "rgba(14,18,56,0.96)",
        border: "1.5px solid rgba(255,255,255,0.20)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
        borderRadius: UI.radius.pill,
        padding: "8px 18px",
        color: UI.text.secondary,
        fontFamily: FONTS.default,
        fontWeight: 600,
        fontSize: UI.font.sm,
        whiteSpace: "nowrap",
        animation: "toastIn 0.25s ease-out",
      }}
    >
      {message}
    </div>
  );
}
