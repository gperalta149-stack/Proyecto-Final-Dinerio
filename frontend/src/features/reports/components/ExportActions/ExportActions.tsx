import React from "react";
import { FileText, FileSpreadsheet, File } from "lucide-react";
import "./ExportActions.css";

interface ExportActionsProps {
  onExportCSV: () => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({ onExportCSV }) => {
  return (
    <div className="ex-wrapper">
      <h3 className="ex-title">Exportar datos</h3>
      <div className="ex-buttons">
        <button className="ex-btn csv" onClick={onExportCSV}>
          <FileText size={15} />
          <span>CSV</span>
        </button>
        <button className="ex-btn excel" disabled>
          <FileSpreadsheet size={15} />
          <span>Excel</span>
        </button>
        <button className="ex-btn pdf" disabled>
          <File size={15} />
          <span>PDF</span>
        </button>
      </div>
      <p className="ex-note">Próximamente Excel y PDF</p>
    </div>
  );
};

export default ExportActions;
