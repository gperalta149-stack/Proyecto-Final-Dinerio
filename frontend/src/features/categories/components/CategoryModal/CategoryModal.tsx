// frontend/src/features/categories/components/CategoryModal/CategoryModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { X, Check, Tag } from "lucide-react";
import { DEFAULT_COLORS } from "../../constants/categoryColors";
import { getCategoryIcon } from "../../utils/getCategoryIcon";
import type { Category, CategoryFormData } from "../../types";
import "../../../../styles/categories/CategoryModal.css";

const normalize = (value: string) =>
  value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

interface CategoryModalProps {
  category?: Category;
  existingCategories?: Category[];
  onSave: (data: CategoryFormData) => Promise<void>;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  existingCategories = [],
  onSave,
  onClose,
}) => {
  const isEditing = !!category;
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    color: DEFAULT_COLORS[0],
  });

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name || "", color: category.color || DEFAULT_COLORS[0] });
    } else {
      setFormData({ name: "", color: DEFAULT_COLORS[0] });
    }
  }, [category]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Nombres ya usados (excluye la propia categoría cuando se está editando).
  // Esto es solo feedback inmediato en el cliente; el backend igual valida
  // con la constraint unique_user_category (ver documentación 4.2.2).
  const takenNames = useMemo(() => {
    return new Set(
      existingCategories
        .filter((c) => !isEditing || c.id !== category?.id)
        .map((c) => normalize(c.name || ""))
    );
  }, [existingCategories, isEditing, category]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameError(null);
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setNameError("El nombre de la categoría es requerido");
      return;
    }
    if (takenNames.has(normalize(trimmedName))) {
      setNameError("Ya tenés una categoría con ese nombre");
      return;
    }

    setLoading(true);
    try {
      await onSave({ name: trimmedName, color: formData.color });
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } } };
      const msg = axiosErr.response?.data?.error;
      if (msg) setNameError(msg);
      console.error("Error saving category:", error);
    } finally {
      setLoading(false);
    }
  };

  const previewName = formData.name.trim() || "Nombre de categoría";

  return (
    <div className="cat-modal-overlay" onClick={onClose}>
      <div className="cat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cat-modal-header">
          <div className="cat-modal-header-info">
            <span className="cat-modal-header-icon">
              <Tag size={18} />
            </span>
            <div>
              <h2 className="cat-modal-title">{isEditing ? "Editar categoría" : "Nueva categoría"}</h2>
              <p className="cat-modal-subtitle">
                {isEditing ? "Actualizá el nombre y el color" : "Organizá tus gastos por color e ícono"}
              </p>
            </div>
          </div>
          <button className="cat-modal-close" onClick={onClose} aria-label="Cerrar" type="button">
            <X size={18} />
          </button>
        </div>

        <div className="cat-modal-scroll">
          {/* Preview en vivo: mismo patrón que SubscriptionModal */}
          <div className="cat-preview-card">
            <span className="cat-preview-label">Vista previa</span>
            <div className="cat-preview-icon" style={{ backgroundColor: `${formData.color}1f`, color: formData.color }}>
              {getCategoryIcon(formData.name || "otros")}
            </div>
            <span className="cat-preview-name">{previewName}</span>
          </div>

          <form onSubmit={handleSubmit} className="cat-modal-form" id="cat-modal-form">
            <div className="cat-form-group">
              <label className="cat-form-label" htmlFor="cat-name">
                Nombre <span className="required">*</span>
              </label>
              <input
                id="cat-name"
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className={`cat-form-input${nameError ? " has-error" : ""}`}
                placeholder="Ej: Entretenimiento, Trabajo, Salud..."
                required
                disabled={loading}
                autoFocus
              />
              {nameError && <p className="cat-form-error">{nameError}</p>}
            </div>

            <div className="cat-form-group">
              <label className="cat-form-label">Color</label>
              <div className="cat-color-grid">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`cat-color-swatch${formData.color === color ? " active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    disabled={loading}
                    aria-label={`Elegir color ${color}`}
                  >
                    {formData.color === color && <Check size={14} color="#fff" />}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="cat-modal-actions">
          <div className="cat-modal-actions-buttons">
            <button type="button" onClick={onClose} className="cat-modal-btn secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" form="cat-modal-form" className="cat-modal-btn primary" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear categoría"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;