import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const usePDFGenerator = () => {
    const generatePDF = useCallback(async (
        elementId: string,
        filename: string
    ) => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with id "${elementId}" not found`);
            return;
        }

        try {
            // Ocultar elementos que no queremos en el PDF
            const hideElements = element.querySelectorAll(
                '.hamburger-trigger, .settings-trigger, .pdf-download-btn, .navigation-controls, .back-to-top, .scroll-hint'
            );
            hideElements.forEach(el => (el as HTMLElement).style.display = 'none');

            // Generar canvas del contenido
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#000000',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // Agregar primera página
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Agregar páginas adicionales si es necesario
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${filename}.pdf`);

            // Restaurar elementos ocultos
            hideElements.forEach(el => (el as HTMLElement).style.display = '');
        } catch (error) {
            console.error('Error generating PDF:', error);
            // Asegurarse de restaurar elementos incluso si hay error
            const hideElements = element.querySelectorAll(
                '.hamburger-trigger, .settings-trigger, .pdf-download-btn, .navigation-controls, .back-to-top, .scroll-hint'
            );
            hideElements.forEach(el => (el as HTMLElement).style.display = '');
        }
    }, []);

    return { generatePDF };
};
