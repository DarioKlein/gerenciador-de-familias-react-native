import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { gerarBytesPlanilhaBackup } from './backup-xlsx';
import type { Familia } from './types';

const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const BACKUP_METADATA_FILENAME = 'backup-metadata.json';
const BACKUP_STORAGE_KEY = 'familias_ultimo_backup_em';

function formatarDataArquivo(date: Date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export async function lerUltimoBackupEm(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined'
        ? localStorage.getItem(BACKUP_STORAGE_KEY)
        : null;
    }

    const file = new File(Paths.document, BACKUP_METADATA_FILENAME);
    if (!file.exists) return null;

    const conteudo = await file.text();
    const parsed = JSON.parse(conteudo) as { ultimoBackupEm?: unknown };
    return typeof parsed.ultimoBackupEm === 'string' ? parsed.ultimoBackupEm : null;
  } catch {
    return null;
  }
}

export async function registrarUltimoBackupEm(
  dataIso = new Date().toISOString()
): Promise<string> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(BACKUP_STORAGE_KEY, dataIso);
      }
      return dataIso;
    }

    const file = new File(Paths.document, BACKUP_METADATA_FILENAME);
    file.create({ overwrite: true });
    await file.write(JSON.stringify({ ultimoBackupEm: dataIso }));
  } catch {
    // Não bloqueia o fluxo se o registro de metadado falhar.
  }
  return dataIso;
}

export function formatarDataUltimoBackup(iso: string | null): string {
  if (!iso) return 'Nenhum backup gerado ainda';

  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return 'Nenhum backup gerado ainda';

  const agora = new Date();
  const hora = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const mesmoDia =
    data.getFullYear() === agora.getFullYear() &&
    data.getMonth() === agora.getMonth() &&
    data.getDate() === agora.getDate();

  if (mesmoDia) return `Último backup: Hoje às ${hora}`;

  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);
  const foiOntem =
    data.getFullYear() === ontem.getFullYear() &&
    data.getMonth() === ontem.getMonth() &&
    data.getDate() === ontem.getDate();

  if (foiOntem) return `Último backup: Ontem às ${hora}`;

  const diaFormatado = data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `Último backup: ${diaFormatado} às ${hora}`;
}

export async function exportarPlanilhaBackup(
  familias: readonly Familia[]
): Promise<{ nomeArquivo: string; dataIso: string }> {
  const bytes = gerarBytesPlanilhaBackup(familias);
  const nomeArquivo = `backup-familias-${formatarDataArquivo(new Date())}.xlsx`;

  if (Platform.OS === 'web') {
    const buffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([buffer], { type: XLSX_MIME_TYPE });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    const disponivel = await Sharing.isAvailableAsync();
    if (!disponivel) {
      throw new Error('O compartilhamento de arquivos não está disponível neste aparelho.');
    }

    const file = new File(Paths.cache, nomeArquivo);
    file.create({ overwrite: true });
    await file.write(bytes);

    await Sharing.shareAsync(file.uri, {
      mimeType: XLSX_MIME_TYPE,
      dialogTitle: 'Salvar ou enviar backup (.xlsx)',
      UTI: 'org.openxmlformats.spreadsheetml.sheet',
    });
  }

  const dataIso = await registrarUltimoBackupEm();
  return { nomeArquivo, dataIso };
}

export async function selecionarArquivoPlanilha(): Promise<{
  nomeArquivo: string;
  bytes: Uint8Array;
} | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [XLSX_MIME_TYPE, 'application/vnd.ms-excel', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  if (!asset.name.toLocaleLowerCase('pt-BR').endsWith('.xlsx')) {
    throw new Error('Selecione um arquivo de planilha no formato .xlsx.');
  }

  if (Platform.OS === 'web') {
    if (asset.file) {
      const arrayBuffer = await asset.file.arrayBuffer();
      return { nomeArquivo: asset.name, bytes: new Uint8Array(arrayBuffer) };
    }
    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();
    return { nomeArquivo: asset.name, bytes: new Uint8Array(arrayBuffer) };
  }

  try {
    const base64 = await readAsStringAsync(asset.uri, {
      encoding: EncodingType.Base64,
    });
    return { nomeArquivo: asset.name, bytes: base64ParaBytes(base64) };
  } catch {
    const response = await fetch(asset.uri);
    const arrayBuffer = await response.arrayBuffer();
    return { nomeArquivo: asset.name, bytes: new Uint8Array(arrayBuffer) };
  }
}

function base64ParaBytes(base64: string): Uint8Array {
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}
