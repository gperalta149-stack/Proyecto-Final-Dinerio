// frontend/src/features/home/components/Footer.tsx
import React from "react";
import '../../../styles/home/footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-bottom">
          <p>© 2026 Dinerio. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
