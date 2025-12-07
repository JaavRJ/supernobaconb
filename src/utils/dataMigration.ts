/**
 * Helper de Migración de Datos
 * 
 * Migra automáticamente:
 * - Partes y capítulos de sampleChapters.ts
 * - Notas del autor de authorNotes.ts  
 * - PDFs de pdfLinks.ts
 * 
 * USO:
 * 1. Accede a /admin (debes ser admin)
 * 2. Abre consola (F12)
 * 3. Ejecuta: window.migrateAllData()
 */

import { ALL_PARTS } from '../data/sampleChapters';
import { PART_1_NOTES, PART_2_NOTES } from '../data/authorNotes';
import { PDF_LINKS } from '../data/pdfLinks';
import { savePart, saveChapter, saveAuthorNote, savePDFInfo } from '../services/contentService';

const migrateAllData = async () => {
    console.log('🚀 Iniciando migración de datos...\n');
    console.log('⏳ Esto puede tomar unos minutos...\n');

    let totalMigrated = 0;
    let errors = 0;

    try {
        // ==================== MIGRAR PARTES Y CAPÍTULOS ====================
        console.log('📚 Migrando partes y capítulos...');

        for (const part of ALL_PARTS) {
            try {
                console.log(`  → Parte ${part.partNumber}: ${part.partTitle}`);

                // Guardar metadata de la parte
                await savePart({
                    partNumber: part.partNumber,
                    partTitle: part.partTitle,
                    description: `Parte ${part.partNumber} del libro Supernoba`
                });
                totalMigrated++;

                // Guardar cada capítulo
                for (let i = 0; i < part.chapters.length; i++) {
                    const chapter = part.chapters[i];
                    console.log(`    • Capítulo ${chapter.number}: ${chapter.title}`);

                    await saveChapter(part.partNumber, i, {
                        number: chapter.number,
                        title: chapter.title,
                        content: chapter.content
                    });
                    totalMigrated++;
                }
            } catch (error) {
                console.error(`    ❌ Error en Parte ${part.partNumber}:`, error);
                errors++;
            }
        }

        console.log('✅ Partes y capítulos migrados\n');

        // ==================== MIGRAR NOTAS DEL AUTOR ====================
        console.log('📝 Migrando notas del autor...');

        const allNotes = [...PART_1_NOTES, ...PART_2_NOTES];

        for (const note of allNotes) {
            try {
                console.log(`  → Nota: ${note.noteTitle}`);

                await saveAuthorNote({
                    id: note.id,
                    partNumber: note.partNumber,
                    chapterIndex: note.chapterIndex,
                    triggerText: note.triggerText,
                    noteTitle: note.noteTitle,
                    noteContent: note.noteContent,
                    type: note.type
                });
                totalMigrated++;
            } catch (error) {
                console.error(`    ❌ Error en nota ${note.id}:`, error);
                errors++;
            }
        }

        console.log('✅ Notas del autor migradas\n');

        // ==================== MIGRAR INFORMACIÓN DE PDFs ====================
        console.log('📄 Migrando información de PDFs...');

        for (const pdf of PDF_LINKS) {
            try {
                console.log(`  → PDF Parte ${pdf.partNumber}`);

                await savePDFInfo({
                    partNumber: pdf.partNumber,
                    pdfUrl: pdf.pdfUrl,
                    filename: pdf.filename
                });
                totalMigrated++;
            } catch (error) {
                console.error(`    ❌ Error en PDF ${pdf.partNumber}:`, error);
                errors++;
            }
        }

        console.log('✅ PDFs migrados\n');

        // ==================== RESUMEN ====================
        console.log('═══════════════════════════════════════');
        console.log('🎉 ¡MIGRACIÓN COMPLETADA!');
        console.log('═══════════════════════════════════════');
        console.log(`✅ Total migrado: ${totalMigrated} elementos`);
        console.log(`❌ Errores: ${errors}`);
        console.log('\n📍 Verifica los datos en:');
        console.log('   https://console.firebase.google.com/');
        console.log('\n🔄 Recarga la página para ver los cambios');
        console.log('═══════════════════════════════════════\n');

        if (errors > 0) {
            console.warn('⚠️  Hubo algunos errores. Revisa los logs arriba.');
        }

    } catch (error) {
        console.error('❌ Error crítico durante la migración:', error);
        console.log('\n💡 Posibles causas:');
        console.log('   1. No eres admin');
        console.log('   2. Reglas de Firebase no están configuradas');
        console.log('   3. Problema de conexión');
    }
};

// Exponer función globalmente
if (typeof window !== 'undefined') {
    (window as any).migrateAllData = migrateAllData;
    console.log('💡 Migración lista. Usa: window.migrateAllData()');
}

export default migrateAllData;
