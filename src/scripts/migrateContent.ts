/**
 * Script de migración de datos hardcodeados a Firebase
 * 
 * Este script migra:
 * - Partes y capítulos de sampleChapters.ts
 * - Notas del autor de authorNotes.ts
 * - PDFs de pdfLinks.ts
 * 
 * IMPORTANTE: Ejecutar solo una vez y con precaución
 */

import { ALL_PARTS } from '../data/sampleChapters';
import { PART_1_NOTES, PART_2_NOTES } from '../data/authorNotes';
import { PDF_LINKS } from '../data/pdfLinks';
import { savePart, saveChapter, saveAuthorNote, savePDFInfo } from '../services/contentService';

export const migrateAllData = async () => {
    console.log('🚀 Iniciando migración de datos...\n');

    try {
        // Migrar partes y capítulos
        console.log('📚 Migrando partes y capítulos...');
        await migrateParts();
        console.log('✅ Partes y capítulos migrados\n');

        // Migrar notas del autor
        console.log('📝 Migrando notas del autor...');
        await migrateAuthorNotes();
        console.log('✅ Notas del autor migradas\n');

        // Migrar información de PDFs
        console.log('📄 Migrando información de PDFs...');
        await migratePDFs();
        console.log('✅ PDFs migrados\n');

        console.log('🎉 ¡Migración completada exitosamente!');
        console.log('\n⚠️  IMPORTANTE: Verifica los datos en Firebase Console');
        console.log('📍 https://console.firebase.google.com/');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    }
};

/**
 * Migra partes y capítulos
 */
const migrateParts = async () => {
    for (const part of ALL_PARTS) {
        console.log(`  → Migrando Parte ${part.partNumber}: ${part.partTitle}`);

        // Guardar metadata de la parte
        await savePart({
            partNumber: part.partNumber,
            partTitle: part.partTitle,
            description: `Parte ${part.partNumber} del libro Supernoba`
        });

        // Guardar cada capítulo
        for (let i = 0; i < part.chapters.length; i++) {
            const chapter = part.chapters[i];
            console.log(`    • Capítulo ${chapter.number}: ${chapter.title}`);

            await saveChapter(part.partNumber, i, {
                number: chapter.number,
                title: chapter.title,
                content: chapter.content
            });
        }
    }
};

/**
 * Migra notas del autor
 */
const migrateAuthorNotes = async () => {
    const allNotes = [...PART_1_NOTES, ...PART_2_NOTES];

    for (const note of allNotes) {
        console.log(`  → Migrando nota: ${note.noteTitle}`);

        await saveAuthorNote({
            id: note.id,
            partNumber: note.partNumber,
            chapterIndex: note.chapterIndex,
            triggerText: note.triggerText,
            noteTitle: note.noteTitle,
            noteContent: note.noteContent,
            type: note.type
        });
    }
};

/**
 * Migra información de PDFs
 */
const migratePDFs = async () => {
    for (const pdf of PDF_LINKS) {
        console.log(`  → Migrando PDF Parte ${pdf.partNumber}`);

        await savePDFInfo({
            partNumber: pdf.partNumber,
            pdfUrl: pdf.pdfUrl,
            filename: pdf.filename
        });
    }
};

/**
 * Función helper para ejecutar la migración desde la consola del navegador
 */
export const runMigration = async () => {
    if (!window.confirm(
        '⚠️ ADVERTENCIA ⚠️\n\n' +
        'Esto migrará todos los datos hardcodeados a Firebase.\n' +
        'Esta acción puede sobrescribir datos existentes.\n\n' +
        '¿Estás seguro de continuar?'
    )) {
        console.log('❌ Migración cancelada');
        return;
    }

    try {
        await migrateAllData();
    } catch (error) {
        console.error('Error en la migración:', error);
    }
};

// Exportar para uso en consola
if (typeof window !== 'undefined') {
    (window as any).runMigration = runMigration;
    console.log('💡 Para ejecutar la migración, escribe en la consola: runMigration()');
}
