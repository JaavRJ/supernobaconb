import React from "react";
import { X, Copyright } from "lucide-react";
import Ins from "./Instagram_Glyph_White.png";
import "../../assets/styles/Footer.css";

export default function Footer() {
  return (
    <footer>
      <div className="footer-rights">
        <Copyright size={12} />
        <span>{new Date().getFullYear()} SUPERNOBA — Todos los derechos reservados    -</span>
      <div className="footer-links">
        <a 
          href="https://instagram.com/supernobaconb"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={Ins} alt="Instagram" />
        </a>

        <a 
          href="https://x.com/cxrcho"
          target="_blank"
          rel="noopener noreferrer"
        >
          <X size={25} />
        </a>
      </div>
      </div>

      
    </footer>
  );
}
