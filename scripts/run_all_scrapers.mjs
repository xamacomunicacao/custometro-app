import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Iniciando Raspagem de Dados Reais 10/10...");

const relatorio = {
   data_execucao: new Date().toISOString(),
   status: {},
   erros: []
};

function runTask(nome, file) {
   const scriptPath = path.join(__dirname, 'scraper', file);
   console.log(`=== ${nome} ===`);
   try {
      execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
      relatorio.status[nome] = 'SUCESSO';
   } catch(e) { 
      console.error(`Erro ${nome}`, e.message); 
      relatorio.status[nome] = 'FALHA';
      relatorio.erros.push({ modulo: nome, erro: e.message });
   }
}

// 1. Senado e Câmara Federal (APIs robustas)
runTask('Senado', 'senado.mjs');
runTask('Camara Federal', 'camara.mjs');

// 2. Assembleia Legislativa do Amazonas
runTask('ALEAM', 'aleam_puppeteer.mjs');

// 3. Camara Municipal de Manaus
runTask('CMM', 'cmm_puppeteer.mjs');

// Gerar e salvar Relatório
const outputPath = path.join(__dirname, '..', 'relatorio_scrap.json');
fs.writeFileSync(outputPath, JSON.stringify(relatorio, null, 2), 'utf-8');

console.log(`Raspagem Concluída! Relatório gerado em: ${outputPath}`);
